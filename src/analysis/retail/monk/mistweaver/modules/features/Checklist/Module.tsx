import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';
import EnvelopingBreath from '../../spells/EnvelopingBreath';
import SoothingMist from '../../spells/SoothingMist';
import SpinningCraneKick from '../../spells/SpinningCraneKick';
import ThunderFocusTea from '../../spells/ThunderFocusTea';
import Vivify from '../../spells/Vivify';
import ChiBurst from '../../spells/ChiBurst';
import JadeSerpentStatue from '../../spells/JadeSerpentStatue';
//import ManaTea from '../../spells/ManaTea';
import RefreshingJadeWind from '../../spells/RefreshingJadeWind';
//import RenewingMistDuringManaTea from '../../spells/RenewingMistDuringManaTea';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';
import VivaciousVivification from '../../spells/VivaciousVivify';
import AncientTeachings from '../../spells/AncientTeachings';
import SheilunsGift from '../../spells/SheilunsGift';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    refreshingJadeWind: RefreshingJadeWind,
    chiBurst: ChiBurst,
    //manaTea: ManaTea,
    thunderFocusTea: ThunderFocusTea,
    //renewingMistDuringManaTea: RenewingMistDuringManaTea,
    spinningCraneKick: SpinningCraneKick,
    vivify: Vivify,
    jadeSerpentStatue: JadeSerpentStatue,
    soothingMist: SoothingMist,
    envelopingBreath: EnvelopingBreath,
    vivaciousVivification: VivaciousVivification,
    ancientTeachings: AncientTeachings,
    sheiluns: SheilunsGift,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected refreshingJadeWind!: RefreshingJadeWind;
  protected chiBurst!: ChiBurst;
  //protected manaTea!: ManaTea;
  protected thunderFocusTea!: ThunderFocusTea;
  //protected renewingMistDuringManaTea!: RenewingMistDuringManaTea;
  protected spinningCraneKick!: SpinningCraneKick;
  protected vivify!: Vivify;
  protected jadeSerpentStatue!: JadeSerpentStatue;
  protected soothingMist!: SoothingMist;
  protected envelopingBreath!: EnvelopingBreath;
  protected vivaciousVivification!: VivaciousVivification;
  protected ancientTeachings!: AncientTeachings;
  protected sheiluns!: SheilunsGift;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          nonHealingTimeSuggestionThresholds:
            this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          envelopingBreath: this.envelopingBreath.suggestionThresholds,
          refreshingJadeWind: this.refreshingJadeWind.suggestionThresholds,
          chiBurst: this.chiBurst.suggestionThresholds,
          spinningCraneKick: this.spinningCraneKick.suggestionThresholds,
          thunderFocusTea: this.thunderFocusTea.suggestionThresholds,
          vivify: this.vivify.suggestionThresholds,
          jadeSerpentStatue: this.jadeSerpentStatue.suggestionThresholds,
          soothingMist: this.soothingMist.suggestionThresholdsCasting,
          vivaciousVivification: this.vivaciousVivification.suggestionThresholds,
          ancientTeachings: this.ancientTeachings.suggestionThresholds,
          sheiluns: this.sheiluns.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
