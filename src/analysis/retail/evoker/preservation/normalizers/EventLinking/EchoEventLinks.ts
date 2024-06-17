import { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CAST_BUFFER_MS,
  EB_BUFFER_MS,
  ECHO,
  ECHO_BUFFER,
  ECHO_REMOVAL,
  ECHO_TEMPORAL_ANOMALY,
  FROM_HARDCAST,
  FROM_TEMPORAL_ANOMALY,
  MAX_ECHO_DURATION,
  SHIELD_FROM_TA_CAST,
  TA_BUFFER_MS,
  TA_ECHO_REMOVAL,
} from './constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { EventType, HasRelatedEvent } from 'parser/core/Events';

export const ECHO_EVENT_LINKS: EventLink[] = [
  /* ECHO CAST TO ECHO APPLY LINKING */
  //link shield apply to cast event
  {
    linkRelation: SHIELD_FROM_TA_CAST,
    linkingEventId: [SPELLS.TEMPORAL_ANOMALY_SHIELD.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: TA_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT);
    },
  },
  // link Echo apply to its CastEvent
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  //link echo apply to the Temporal Anomaly shield application
  {
    linkRelation: FROM_TEMPORAL_ANOMALY,
    reverseLinkRelation: FROM_TEMPORAL_ANOMALY,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
    additionalCondition(linkedEvent, referencedEvent) {
      return !HasRelatedEvent(linkedEvent, FROM_HARDCAST);
    },
  },
  /* ECHO APPLY TO ECHO REMOVAL LINKING */
  // link echo removal to echo apply
  {
    linkRelation: ECHO_REMOVAL,
    reverseLinkRelation: ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_HARDCAST);
    },
  },
  // link ta echo removal to apply
  {
    linkRelation: TA_ECHO_REMOVAL,
    reverseLinkRelation: TA_ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_TEMPORAL_ANOMALY);
    },
  },
  /* ECHO REMOVAL TO HOT APPLY */
  //link hardcast echo removal to hot application
  {
    linkRelation: ECHO,
    reverseLinkRelation: ECHO,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(linkedEvent, ECHO_REMOVAL);
    },
  },
  //link TA echo removal to hot application
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    reverseLinkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO)
      );
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  /* ECHO REMOVAL TO HEAL */
  // link echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO,
    reverseLinkRelation: ECHO,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.SPIRITBLOOM.id,
      SPELLS.VERDANT_EMBRACE_HEAL.id,
    ],
    referencedEventType: EventType.Heal,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, ECHO_REMOVAL);
    },
  },
  // link EB heal to echo remove
  {
    linkRelation: ECHO,
    reverseLinkRelation: ECHO,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, ECHO_REMOVAL);
    },
  },
  // link TA echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    reverseLinkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.VERDANT_EMBRACE_HEAL.id,
    ],
    referencedEventType: EventType.Heal,
    maximumLinks: 1,
    forwardBufferMs: ECHO_BUFFER,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        HasRelatedEvent(linkingEvent, FROM_TEMPORAL_ANOMALY) &&
        HasRelatedEvent(linkingEvent, FROM_TEMPORAL_ANOMALY) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO)
      );
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // special handling for TA Echo EB because it heals 3-5 targets and happens after 2s
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    reverseLinkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: EB_BUFFER_MS + 250,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO)
      );
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
];
