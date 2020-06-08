/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  addParticipant,
  getCourtType,
  getDiversionPlans,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipantPhotos,
  getParticipants,
  RESET_REQUEST_STATE,
} from './ParticipantsActions';
import {
  SEARCH_EXISTING_PEOPLE,
  SELECT_EXISTING_PERSON,
  searchExistingPeople,
  selectExistingPerson,
} from './newparticipant/NewParticipantActions';
import { PEOPLE } from '../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  ADD_PARTICIPANT,
  COURT_TYPE_BY_PARTICIPANT,
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  EXISTING_PERSON,
  GET_COURT_TYPE,
  GET_DIVERSION_PLANS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANT_PHOTOS,
  GET_PARTICIPANTS,
  HOURS_WORKED,
  INFRACTIONS_BY_PARTICIPANT,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  NEW_PARTICIPANT_EKID,
  PEOPLE_ALREADY_IN_ENTITY_SET,
  PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID,
  PARTICIPANTS,
  REQUEST_STATE,
} = PEOPLE;

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
    [GET_PARTICIPANT_PHOTOS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SEARCH_EXISTING_PEOPLE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [SELECT_EXISTING_PERSON]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [COURT_TYPE_BY_PARTICIPANT]: Map(),
  [CURRENT_DIVERSION_PLANS_BY_PARTICIPANT]: Map(),
  [ENROLLMENT_BY_PARTICIPANT]: Map(),
  [EXISTING_PERSON]: Map(),
  [HOURS_WORKED]: Map(),
  [INFRACTIONS_BY_PARTICIPANT]: Map(),
  [INFRACTION_COUNTS_BY_PARTICIPANT]: Map(),
  [NEW_PARTICIPANT_EKID]: '',
  [PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID]: Map(),
  [PARTICIPANTS]: List(),
  [PEOPLE_ALREADY_IN_ENTITY_SET]: List(),
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

    case selectExistingPerson.case(action.type): {
      const { value } = action;
      const { existingPerson } = value;
      return state
        .set(EXISTING_PERSON, existingPerson);
    }

    case addParticipant.case(action.type): {

      return addParticipant.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_PARTICIPANT, action.id], action)
          .setIn([ACTIONS, ADD_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          return state
            .set(NEW_PARTICIPANT_EKID, value)
            .setIn([ACTIONS, ADD_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
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

    case getParticipantPhotos.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getParticipantPhotos.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_PHOTOS, seqAction.id], seqAction)
          .setIn([ACTIONS, GET_PARTICIPANT_PHOTOS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = seqAction;
          return state
            .set(PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID, value)
            .setIn([ACTIONS, GET_PARTICIPANT_PHOTOS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(COURT_TYPE_BY_PARTICIPANT, Map())
          .setIn([ACTIONS, GET_PARTICIPANT_PHOTOS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, GET_PARTICIPANT_PHOTOS, seqAction.id]),
      });
    }

    case getCourtType.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getCourtType.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_COURT_TYPE, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_COURT_TYPE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = seqAction;
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

    case searchExistingPeople.case(action.type): {

      return searchExistingPeople.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, SEARCH_EXISTING_PEOPLE, action.id], action)
          .setIn([ACTIONS, SEARCH_EXISTING_PEOPLE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          return state
            .set(PEOPLE_ALREADY_IN_ENTITY_SET, value)
            .setIn([ACTIONS, SEARCH_EXISTING_PEOPLE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SEARCH_EXISTING_PEOPLE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SEARCH_EXISTING_PEOPLE, action.id]),
      });
    }

    default:
      return state;
  }
}
