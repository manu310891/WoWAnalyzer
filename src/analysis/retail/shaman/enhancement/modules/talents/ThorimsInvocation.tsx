import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { Trans, t } from '@lingui/macro';
import { THORIMS_INVOCATION_LINK } from '../normalizers/EventLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import DamageIcon from 'interface/icons/Damage';
import UptimeIcon from 'interface/icons/Uptime';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/** Lightning Bolt and Chain Lightning damage increased by 20%.
 *
 * While Ascendance is active, Windstrike automatically consumes up to 5 Maelstrom Weapon stacks to
 * discharge a Lightning Bolt or Chain Lightning at your enemy, whichever you most recently used. */

interface ThorimsInvocationProc {
  count: number;
  damage: number;
}

class ThorimsInvocation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    gcd: GlobalCooldown,
  };

  protected spellUsable!: SpellUsable;
  protected gcd!: GlobalCooldown;
  protected lastSpellId: number | undefined;
  protected procs: Record<number, ThorimsInvocationProc> = {
    [SPELLS.LIGHTNING_BOLT.id]: { count: 0, damage: 0 },
    [TALENTS.CHAIN_LIGHTNING_TALENT.id]: { count: 0, damage: 0 },
  };
  protected increaseDamage = 0;
  protected lastSpellCast: number | null = null;
  protected ascendanceEndTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT);
    if (!this.active) {
      return;
    }
    const ascendanceDuration = this.selectedCombatant.hasTalent(
      TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT,
    )
      ? 6000
      : 15000;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
      (event: ApplyBuffEvent) =>
        (this.ascendanceEndTimestamp = event.timestamp + ascendanceDuration),
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT]),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    const linkedEvent = event._linkedEvents?.find((le) => le.relation === THORIMS_INVOCATION_LINK)
      ?.event as DamageEvent;
    if (!linkedEvent) {
      return;
    }
    const spellId = linkedEvent.ability.guid;

    this.procs[spellId].count += 1;
    this.procs[spellId].damage += linkedEvent.amount;
    this.lastSpellCast = spellId;

    if (spellId === TALENTS.CHAIN_LIGHTNING_TALENT.id) {
      const mswStacks =
        this.selectedCombatant.getBuff(SPELLS.MAELSTROM_WEAPON_BUFF.id)?.stacks || 0;
      const remainingAscendance = this.ascendanceEndTimestamp - event.timestamp;
      const cracklingThunder = this.selectedCombatant.hasBuff(
        SPELLS.CRACKLING_THUNDER_TIER_BUFF.id,
      );
      if (
        mswStacks >= 5 &&
        !cracklingThunder &&
        remainingAscendance >
          this.spellUsable.cooldownRemaining(SPELLS.WINDSTRIKE_CAST.id) +
            this.gcd.getGlobalCooldownDuration(event.ability.guid)
      ) {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = t({
          id: 'shaman.enhancement.windstrike.inefficientCastReason',
          message: "You should have re-primed Thorim's Invocation with Lightning Bolt.",
        });
      } else if (!cracklingThunder) {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = t({
          id: 'shaman.enhancement.windstrike.inefficientCastReason',
          message: "Thorim's Invocation was not primed with Lightning Bolt.",
        });
      }
    }
  }

  onDamage(event: DamageEvent) {
    this.increaseDamage += calculateEffectiveDamage(event, 0.2);
  }

  get damageDone() {
    return (
      this.increaseDamage +
      this.procs[SPELLS.LIGHTNING_BOLT.id].damage +
      this.procs[TALENTS.CHAIN_LIGHTNING_TALENT.id].damage
    );
  }

  get totalProcs() {
    return (
      this.procs[SPELLS.LIGHTNING_BOLT.id].count +
      this.procs[TALENTS.CHAIN_LIGHTNING_TALENT.id].count
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <Trans>
              <SpellLink spell={SPELLS.LIGHTNING_BOLT} />{' '}
              <strong>{formatNumber(this.procs[SPELLS.LIGHTNING_BOLT.id].count)}</strong> casts -{' '}
              <DamageIcon />{' '}
              <strong>{formatNumber(this.procs[SPELLS.LIGHTNING_BOLT.id].damage)}</strong> damage
              done
              <br />
              <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} />{' '}
              <strong>{formatNumber(this.procs[TALENTS.CHAIN_LIGHTNING_TALENT.id].count)}</strong>{' '}
              casts - <DamageIcon />{' '}
              <strong>{formatNumber(this.procs[TALENTS.CHAIN_LIGHTNING_TALENT.id].damage)}</strong>{' '}
              damage done
              <br />
              Total <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> and{' '}
              <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> damage increased by{' '}
              <DamageIcon /> <strong>{formatNumber(this.increaseDamage)}</strong>
            </Trans>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.THORIMS_INVOCATION_TALENT}>
          <ItemDamageDone amount={this.damageDone} />
          <br />
          <UptimeIcon /> {this.totalProcs} <small>spells cast</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ThorimsInvocation;
