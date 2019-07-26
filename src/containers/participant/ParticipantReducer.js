// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addNewDiversionPlanStatus,
  getAllParticipantInfo,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getRequiredHours,
  getSentenceTerm,
  getWorksiteByWorksitePlan,
  getWorksitePlans,
} from './ParticipantActions';
import { getPropertyFqnFromEdm } from '../../utils/DataUtils';
import { PERSON } from '../../utils/constants/ReduxStateConsts';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { ENTITY_KEY_ID } from '../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADDRESS,
  CASE_NUMBER,
  DIVERSION_PLAN,
  EMAIL,
  ENROLLMENT_STATUS,
  ERRORS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_REQUIRED_HOURS,
  GET_SENTENCE_TERM,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  PARTICIPANT,
  PHONE,
  REQUEST_STATE,
  REQUIRED_HOURS,
  SENTENCE_TERM,
  VIOLATIONS,
  WARNINGS,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS,
} = PERSON;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_NEW_DIVERSION_PLAN_STATUS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ALL_PARTICIPANT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CASE_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_STATUS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_ADDRESS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_INFRACTIONS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_REQUIRED_HOURS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_SENTENCE_TERM]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ADDRESS]: '',
  [CASE_NUMBER]: List(),
  [DIVERSION_PLAN]: Map(),
  [EMAIL]: '',
  [ENROLLMENT_STATUS]: Map(),
  [ERRORS]: {
    [ADD_NEW_DIVERSION_PLAN_STATUS]: Map(),
    [GET_ALL_PARTICIPANT_INFO]: Map(),
    [GET_CASE_INFO]: Map(),
    [GET_CONTACT_INFO]: Map(),
    [GET_ENROLLMENT_STATUS]: Map(),
    [GET_PARTICIPANT]: Map(),
    [GET_PARTICIPANT_ADDRESS]: Map(),
    [GET_PARTICIPANT_INFRACTIONS]: Map(),
    [GET_REQUIRED_HOURS]: Map(),
    [GET_SENTENCE_TERM]: Map(),
  },
  [PARTICIPANT]: Map(),
  [PHONE]: '',
  [REQUIRED_HOURS]: 0,
  [SENTENCE_TERM]: Map(),
  [VIOLATIONS]: Map(),
  [WARNINGS]: Map(),
  [WORKSITES_BY_WORKSITE_PLAN]: Map(),
  [WORKSITE_PLANS]: List(),
});

export default function participantReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addNewDiversionPlanStatus.case(action.type): {

      return addNewDiversionPlanStatus.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, action.id], action)
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { edm, enrollmentStatusEKID, enrollmentStatusESID } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const storedEnrollmentEntity :Map = fromJS(entityData[enrollmentStatusESID][0]);


            let newEnrollmentStatus :Map = Map();
            storedEnrollmentEntity.forEach((enrollmentValue, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newEnrollmentStatus = newEnrollmentStatus.set(propertyTypeFqn, enrollmentValue);
            });
            newEnrollmentStatus = newEnrollmentStatus.set(ENTITY_KEY_ID, enrollmentStatusEKID);

            return state
              .set(ENROLLMENT_STATUS, newEnrollmentStatus)
              .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, action.id]),
      });
    }

    case getAllParticipantInfo.case(action.type): {

      return getAllParticipantInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .setIn([ERRORS, GET_ALL_PARTICIPANT_INFO], value)
            .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id])
      });
    }

    case getCaseInfo.case(action.type): {

      return getCaseInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CASE_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CASE_INFO, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(CASE_NUMBER, value)
            .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(CASE_NUMBER, List())
            .setIn([ERRORS, GET_CASE_INFO], value)
            .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CASE_INFO, action.id])
      });
    }

    case getContactInfo.case(action.type): {

      return getContactInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CONTACT_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CONTACT_INFO, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(EMAIL, value.get('email'))
            .set(PHONE, value.get('phone'))
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(EMAIL, '')
            .set(PHONE, '')
            .setIn([ERRORS, GET_CONTACT_INFO], value)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CONTACT_INFO, action.id])
      });
    }

    case getEnrollmentStatus.case(action.type): {

      return getEnrollmentStatus.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ENROLLMENT_STATUS, value.enrollmentStatus)
            .set(DIVERSION_PLAN, value.diversionPlan)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(ENROLLMENT_STATUS, Map())
            .setIn([ERRORS, GET_ENROLLMENT_STATUS], value)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id])
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

          return state
            .set(VIOLATIONS, value.get(INFRACTIONS_CONSTS.VIOLATION))
            .set(WARNINGS, value.get(INFRACTIONS_CONSTS.WARNING))
            .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(VIOLATIONS, Map())
            .set(WARNINGS, Map())
            .setIn([ERRORS, GET_PARTICIPANT_INFRACTIONS], value)
            .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id])
      });
    }

    case getParticipant.case(action.type): {

      return getParticipant.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PARTICIPANT, value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(PARTICIPANT, Map())
            .setIn([ERRORS, GET_PARTICIPANT], value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT, action.id])
      });
    }

    case getParticipantAddress.case(action.type): {

      return getParticipantAddress.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ADDRESS, value)
            .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(ADDRESS, '')
            .setIn([ERRORS, GET_PARTICIPANT_ADDRESS], value)
            .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id])
      });
    }

    case getRequiredHours.case(action.type): {

      return getRequiredHours.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_REQUIRED_HOURS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_REQUIRED_HOURS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_REQUIRED_HOURS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(REQUIRED_HOURS, value)
            .setIn([ACTIONS, GET_REQUIRED_HOURS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(REQUIRED_HOURS, 0)
            .setIn([ERRORS, GET_REQUIRED_HOURS], value)
            .setIn([ACTIONS, GET_REQUIRED_HOURS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_REQUIRED_HOURS, action.id])
      });
    }

    case getSentenceTerm.case(action.type): {

      return getSentenceTerm.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_SENTENCE_TERM, action.id], fromJS(action))
          .setIn([ACTIONS, GET_SENTENCE_TERM, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_SENTENCE_TERM, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(SENTENCE_TERM, value)
            .setIn([ACTIONS, GET_SENTENCE_TERM, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(SENTENCE_TERM, Map())
            .setIn([ERRORS, GET_SENTENCE_TERM], value)
            .setIn([ACTIONS, GET_SENTENCE_TERM, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_SENTENCE_TERM, action.id])
      });
    }

    case getWorksitePlans.case(action.type): {

      return getWorksitePlans.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLANS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_PLANS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITE_PLANS, value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(SENTENCE_TERM, Map())
            .setIn([ERRORS, GET_WORKSITE_PLANS], value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLANS, action.id])
      });
    }

    case getWorksiteByWorksitePlan.case(action.type): {

      return getWorksiteByWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITES_BY_WORKSITE_PLAN, value)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(SENTENCE_TERM, Map())
            .setIn([ERRORS, GET_WORKSITE_BY_WORKSITE_PLAN], value)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id])
      });
    }

    default:
      return state;
  }
}
