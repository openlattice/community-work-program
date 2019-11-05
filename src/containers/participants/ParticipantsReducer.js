/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addParticipant,
  getCourtType,
  getDiversionPlans,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipants,
  RESET_REQUEST_STATE,
} from './ParticipantsActions';
import { PEOPLE } from '../../utils/constants/ReduxStateConsts';
import { getPropertyFqnFromEdm } from '../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  ADD_PARTICIPANT,
  COURT_TYPE_BY_PARTICIPANT,
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  ERRORS,
  GET_COURT_TYPE,
  GET_DIVERSION_PLANS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  HOURS_WORKED,
  INFRACTIONS_BY_PARTICIPANT,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  REQUEST_STATE,
} = PEOPLE;
const { REQUIRED_HOURS } = PROPERTY_TYPE_FQNS;

const DIVERSION_PLAN = 'diversionPlan';
const PERSON = 'person';

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_TYPE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_STATUSES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_HOURS_WORKED]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFRACTIONS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [COURT_TYPE_BY_PARTICIPANT]: Map(),
  [CURRENT_DIVERSION_PLANS_BY_PARTICIPANT]: Map(),
  [ENROLLMENT_BY_PARTICIPANT]: Map(),
  [ERRORS]: {
    [ADD_PARTICIPANT]: Map(),
    [GET_ENROLLMENT_STATUSES]: Map(),
    [GET_HOURS_WORKED]: Map(),
    [GET_INFRACTIONS]: Map(),
    [GET_PARTICIPANTS]: Map(),
  },
  [HOURS_WORKED]: Map(),
  [INFRACTIONS_BY_PARTICIPANT]: Map(),
  [INFRACTION_COUNTS_BY_PARTICIPANT]: Map(),
  [PARTICIPANTS]: List(),
});

export default function participantsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (state.has(actionType)) {
        return state.setIn([actionType, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case addParticipant.case(action.type): {

      return addParticipant.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_PARTICIPANT, action.id], action)
          .setIn([ACTIONS, ADD_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_PARTICIPANT, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction; // success value
            const {
              diversionPlanESID,
              edm,
              personEKID,
              peopleESID,
            } = value;

            const storedValue :Object = storedSeqAction.value; // request value
            const { entityData } :Object = storedValue;
            const storedEntities :Map = Map().withMutations((map :Map) => {
              map.set(PERSON, fromJS(entityData[peopleESID][0]));
              map.set(DIVERSION_PLAN, fromJS(entityData[diversionPlanESID][0]));
            });
            let newEntities :Map = Map();
            storedEntities.forEach((entity :Map, key :string) => {
              let newEntity = Map();
              entity.forEach((entityValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                newEntity = newEntity.set(propertyTypeFqn, entityValue);
              });
              newEntities = newEntities.set(key, newEntity);
            });

            let person = newEntities.get(PERSON);
            person = person.set(ENTITY_KEY_ID, personEKID);
            newEntities = newEntities.set(PERSON, person);

            const participants :List = state.get(PARTICIPANTS)
              .push(newEntities.get(PERSON));
            const enrollmentByParticipant = state.get(ENROLLMENT_BY_PARTICIPANT)
              .set(personEKID, Map());
            const required = newEntities.getIn([DIVERSION_PLAN, REQUIRED_HOURS, 0], 0);
            const hoursWorked = state.get(HOURS_WORKED)
              .set(personEKID, Map({ worked: 0, required }));

            return state
              .set(PARTICIPANTS, participants)
              .set(ENROLLMENT_BY_PARTICIPANT, enrollmentByParticipant)
              .set(HOURS_WORKED, hoursWorked)
              .setIn([ACTIONS, ADD_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_PARTICIPANT, action.id]),
      });
    }

    case getParticipants.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getParticipants.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANTS, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_PARTICIPANTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANTS, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PARTICIPANTS, value)
            .setIn([ACTIONS, GET_PARTICIPANTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(PARTICIPANTS, List())
          .setIn([ACTIONS, GET_PARTICIPANTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_PARTICIPANTS, seqAction.id]),
      });
    }

    case getCourtType.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getCourtType.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_COURT_TYPE, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_COURT_TYPE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_COURT_TYPE, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(COURT_TYPE_BY_PARTICIPANT, value)
            .setIn([ACTIONS, GET_COURT_TYPE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(COURT_TYPE_BY_PARTICIPANT, Map())
          .setIn([ACTIONS, GET_COURT_TYPE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_COURT_TYPE, seqAction.id]),
      });
    }

    case getDiversionPlans.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getDiversionPlans.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_DIVERSION_PLANS, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_DIVERSION_PLANS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, GET_DIVERSION_PLANS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_DIVERSION_PLANS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_DIVERSION_PLANS, seqAction.id]),
      });
    }

    case getEnrollmentStatuses.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getEnrollmentStatuses.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ENROLLMENT_STATUSES, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ENROLLMENT_BY_PARTICIPANT, value.enrollmentMap)
            .set(CURRENT_DIVERSION_PLANS_BY_PARTICIPANT, value.currentDiversionPlansByParticipant)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(ENROLLMENT_BY_PARTICIPANT, List())
          .set(CURRENT_DIVERSION_PLANS_BY_PARTICIPANT, Map())
          .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_ENROLLMENT_STATUSES, seqAction.id]),
      });
    }

    case getInfractions.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getInfractions.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_INFRACTIONS, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_INFRACTIONS, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(INFRACTIONS_BY_PARTICIPANT, value.infractionsMap)
            .set(INFRACTION_COUNTS_BY_PARTICIPANT, value.infractionCountMap)
            .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(INFRACTIONS_BY_PARTICIPANT, Map())
          .set(INFRACTION_COUNTS_BY_PARTICIPANT, Map())
          .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_INFRACTIONS, seqAction.id]),
      });
    }

    case getHoursWorked.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getHoursWorked.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_HOURS_WORKED, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_HOURS_WORKED, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_HOURS_WORKED, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(HOURS_WORKED, value)
            .setIn([ACTIONS, GET_HOURS_WORKED, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(HOURS_WORKED, Map())
          .setIn([ACTIONS, GET_HOURS_WORKED, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_HOURS_WORKED, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
