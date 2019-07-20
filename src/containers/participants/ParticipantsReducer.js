/*
 * @flow
 */

import isNumber from 'lodash/isNumber';
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addParticipant,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipants,
  getSentenceTerms,
  getSentences,
  RESET_REQUEST_STATE,
} from './ParticipantsActions';
import { PEOPLE } from '../../utils/constants/ReduxStateConsts';
import { getPropertyFqnFromEdm } from '../../utils/DataUtils';
import { DIVERSION_PLAN_FQNS, ENTITY_KEY_ID } from '../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  ADD_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  ERRORS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  GET_SENTENCE_TERMS,
  GET_SENTENCES,
  HOURS_WORKED,
  INFRACTIONS_BY_PARTICIPANT,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  REQUEST_STATE,
  SENTENCE_TERMS_BY_PARTICIPANT,
} = PEOPLE;
const { REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_PARTICIPANT]: {
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
    [GET_SENTENCE_TERMS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_SENTENCES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ENROLLMENT_BY_PARTICIPANT]: Map(),
  [ERRORS]: {
    [ADD_PARTICIPANT]: Map(),
    [GET_ENROLLMENT_STATUSES]: Map(),
    [GET_HOURS_WORKED]: Map(),
    [GET_INFRACTIONS]: Map(),
    [GET_PARTICIPANTS]: Map(),
    [GET_SENTENCE_TERMS]: Map(),
    [GET_SENTENCES]: Map(),
  },
  [HOURS_WORKED]: Map(),
  [INFRACTIONS_BY_PARTICIPANT]: Map(),
  [INFRACTION_COUNTS_BY_PARTICIPANT]: Map(),
  [PARTICIPANTS]: List(),
  [SENTENCE_TERMS_BY_PARTICIPANT]: Map(),
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
              manualSentenceESID,
              personEKID,
              peopleESID,
              sentenceTermESID,
            } = value;

            const storedValue :Object = storedSeqAction.value; // request value
            const { entityData } :Object = storedValue;
            const storedEntities :Map = Map().withMutations((map :Map) => {
              map.set('person', Map(entityData[peopleESID][0]));
              map.set('sentence', Map(entityData[manualSentenceESID][0]));
              map.set('sentenceTerm', Map(entityData[sentenceTermESID][0]));
              map.set('diversionPlan', Map(entityData[diversionPlanESID][0]));
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

            let person = newEntities.get('person');
            person = person.set(ENTITY_KEY_ID, personEKID);
            newEntities = newEntities.set('person', person);

            const participants :List = state.get(PARTICIPANTS)
              .push(newEntities.get('person'));
            let sentenceTermsByParticipant = state.get(SENTENCE_TERMS_BY_PARTICIPANT);
            sentenceTermsByParticipant = sentenceTermsByParticipant.set(personEKID, newEntities.get('sentenceTerm'));
            let enrollmentByParticipant = state.get(ENROLLMENT_BY_PARTICIPANT);
            enrollmentByParticipant = enrollmentByParticipant.set(personEKID, Map());
            let hoursWorked = state.get(HOURS_WORKED);
            const required = newEntities.getIn(['diversionPlan', REQUIRED_HOURS, 0], 0);
            hoursWorked = hoursWorked.set(personEKID, Map({ worked: 0, required }));

            return state
              .set(PARTICIPANTS, participants)
              .set(SENTENCE_TERMS_BY_PARTICIPANT, sentenceTermsByParticipant)
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

        REQUEST: () => {
          return state
            .setIn([ACTIONS, GET_PARTICIPANTS, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, GET_PARTICIPANTS, REQUEST_STATE], RequestStates.PENDING);
        },
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
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(PARTICIPANTS, List())
            .setIn([ERRORS, GET_PARTICIPANTS], error)
            .setIn([ACTIONS, GET_PARTICIPANTS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_PARTICIPANTS, seqAction.id]);
        },
      });
    }

    case getSentences.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getSentences.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn([ACTIONS, GET_SENTENCES, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, GET_SENTENCES, REQUEST_STATE], RequestStates.PENDING);
        },
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_SENTENCES, seqAction.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, GET_SENTENCES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .setIn([ERRORS, GET_SENTENCES], error)
            .setIn([ACTIONS, GET_SENTENCES, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_SENTENCES, seqAction.id]);
        },
      });
    }

    case getEnrollmentStatuses.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getEnrollmentStatuses.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, REQUEST_STATE], RequestStates.PENDING);
        },
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ENROLLMENT_STATUSES, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ENROLLMENT_BY_PARTICIPANT, value)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(ENROLLMENT_BY_PARTICIPANT, List())
            .setIn([ERRORS, GET_ENROLLMENT_STATUSES], error)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUSES, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_ENROLLMENT_STATUSES, seqAction.id]);
        },
      });
    }

    case getInfractions.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getInfractions.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn([ACTIONS, GET_INFRACTIONS, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.PENDING);
        },
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
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(INFRACTIONS_BY_PARTICIPANT, Map())
            .set(INFRACTION_COUNTS_BY_PARTICIPANT, Map())
            .setIn([ERRORS, GET_INFRACTIONS], error)
            .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_INFRACTIONS, seqAction.id]);
        },
      });
    }

    case getHoursWorked.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getHoursWorked.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn([ACTIONS, GET_HOURS_WORKED, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, GET_HOURS_WORKED, REQUEST_STATE], RequestStates.PENDING);
        },
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
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(HOURS_WORKED, Map())
            .setIn([ERRORS, GET_HOURS_WORKED], error)
            .setIn([ACTIONS, GET_HOURS_WORKED, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_HOURS_WORKED, seqAction.id]);
        },
      });
    }

    case getSentenceTerms.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getSentenceTerms.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn([ACTIONS, GET_SENTENCE_TERMS, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, GET_SENTENCE_TERMS, REQUEST_STATE], RequestStates.PENDING);
        },
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_SENTENCE_TERMS, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(SENTENCE_TERMS_BY_PARTICIPANT, value)
            .setIn([ACTIONS, GET_SENTENCE_TERMS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(SENTENCE_TERMS_BY_PARTICIPANT, Map())
            .setIn([ERRORS, GET_SENTENCE_TERMS], error)
            .setIn([ACTIONS, GET_SENTENCE_TERMS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_SENTENCE_TERMS, seqAction.id]);
        },
      });
    }

    default:
      return state;
  }
}
