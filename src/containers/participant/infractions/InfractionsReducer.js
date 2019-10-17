// @flow
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addInfraction,
  getInfractionTypes,
  getParticipantInfractions,
} from './InfractionsActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../../utils/DataUtils';
import { PERSON_INFRACTIONS } from '../../../utils/constants/ReduxStateConsts';
import { INFRACTIONS_CONSTS } from '../../../core/edm/constants/DataModelConsts';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  INFRACTION_EVENT_FQNS,
  INFRACTION_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';

const { WORKSITE_PLAN } = APP_TYPE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { TYPE } = INFRACTION_EVENT_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const {
  ACTIONS,
  ADD_INFRACTION_EVENT,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT_INFRACTIONS,
  INFRACTIONS_INFO,
  INFRACTION_TYPES,
  REQUEST_STATE,
  VIOLATIONS,
  WARNINGS,
} = PERSON_INFRACTIONS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_INFRACTION_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFRACTION_TYPES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_INFRACTIONS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [INFRACTIONS_INFO]: Map(),
  [INFRACTION_TYPES]: List(),
  [VIOLATIONS]: List(),
  [WARNINGS]: List(),
});


export default function infractionsReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addInfraction.case(action.type): {

      return addInfraction.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_INFRACTION_EVENT, action.id], action)
          .setIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_INFRACTION_EVENT, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              edm,
              enrollmentStatusESID,
              infractionESID,
              infractionEventEKID,
              infractionEventESID,
              resultsInESID,
              registeredForESID,
              worksitePlanESID,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { associationEntityData, entityData } :Object = requestValue;

            const storedInfractionEventEntity :Map = fromJS(entityData[infractionEventESID][0]);
            const storedEnrollmentStatusEntity :Map = entityData[enrollmentStatusESID]
              ? fromJS(entityData[enrollmentStatusESID][0])
              : Map();

            const worksitePlan :Map = associationEntityData[resultsInESID]
              ? fromJS(associationEntityData[resultsInESID])
                .find((association :Map) => association.get('srcEntitySetId') === worksitePlanESID)
              : Map();
            const worksitePlanEKID :UUID = worksitePlan ? worksitePlan.get('srcEntityKeyId', '') : '';

            const infraction = associationEntityData[registeredForESID]
              ? fromJS(associationEntityData[registeredForESID])
                .find((association :Map) => association.get('dstEntitySetId') === infractionESID)
              : Map();
            const infractionEKID :UUID = infraction ? infraction.get('dstEntityKeyId', '') : '';

            const newInfractionEvent = Map().withMutations((map) => {
              map.set(ENTITY_KEY_ID, infractionEventEKID);
              storedInfractionEventEntity.forEach((infractionEventValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                map.set(propertyTypeFqn, infractionEventValue);
              });
            });

            let violations = state.get(VIOLATIONS);
            let warnings = state.get(WARNINGS);
            const { [TYPE]: infractionType } = getEntityProperties(newInfractionEvent, [TYPE]);
            if (infractionType === INFRACTIONS_CONSTS.VIOLATION) violations = violations.push(newInfractionEvent);
            if (infractionType === INFRACTIONS_CONSTS.WARNING) warnings = warnings.push(newInfractionEvent);

            const infractionTypes :List = state.get(INFRACTION_TYPES);
            const infractionEntity = infraction
              ? infractionTypes.find((type :Map) => getEntityKeyId(type) === infractionEKID)
              : Map();
            const { [CATEGORY]: category } = getEntityProperties(infractionEntity, [CATEGORY]);
            const statusPTID = getPropertyTypeIdFromEdm(edm, STATUS);
            const status = storedEnrollmentStatusEntity.getIn([statusPTID, 0], '');
            const info :Map = fromJS({
              [CATEGORY]: category,
              [STATUS]: status,
              [WORKSITE_PLAN]: worksitePlanEKID,
            });
            const infractionsInfo = state.get(INFRACTIONS_INFO)
              .set(infractionEventEKID, info);

            return state
              .set(VIOLATIONS, violations)
              .set(WARNINGS, warnings)
              .set(INFRACTIONS_INFO, infractionsInfo)
              .setIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .set(INFRACTIONS_INFO, List())
          .setIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_INFRACTION_EVENT, action.id]),
      });
    }

    case getInfractionTypes.case(action.type): {

      return getInfractionTypes.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_INFRACTION_TYPES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_INFRACTION_TYPES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_INFRACTION_TYPES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(INFRACTION_TYPES, value)
            .setIn([ACTIONS, GET_INFRACTION_TYPES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_INFRACTION_TYPES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFRACTION_TYPES, action.id])
      });
    }

    case getParticipantInfractions.case(action.type): {

      return getParticipantInfractions.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }
          const { infractionInfoMap, infractionsMap } = value;

          return state
            .set(VIOLATIONS, infractionsMap.get(INFRACTIONS_CONSTS.VIOLATION))
            .set(WARNINGS, infractionsMap.get(INFRACTIONS_CONSTS.WARNING))
            .set(INFRACTIONS_INFO, infractionInfoMap)
            .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id])
      });
    }

    default:
      return state;
  }
}
