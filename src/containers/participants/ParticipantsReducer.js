/*
 * @flow
 */

import isNumber from 'lodash/isNumber';
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  findCommunityServiceSentences,
  getEnrollmentStatuses,
  getInfractions,
  getParticipants,
  getSentences,
  RESET_REQUEST_STATE,
} from './ParticipantsActions';
import { PEOPLE } from '../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  ENROLLMENT_BY_PARTICIPANT,
  ERRORS,
  FIND_COMMUNITY_SERVICE_SENTENCES,
  GET_ENROLLMENT_STATUSES,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  GET_SENTENCES,
  INFRACTIONS_BY_PARTICIPANT,
  PARTICIPANTS,
  REQUEST_STATE,
  SENTENCES_BY_PARTICIPANT,
} = PEOPLE;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [FIND_COMMUNITY_SERVICE_SENTENCES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_STATUSES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFRACTIONS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_SENTENCES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ERRORS]: {
    [FIND_COMMUNITY_SERVICE_SENTENCES]: Map(),
    [GET_ENROLLMENT_STATUSES]: Map(),
    [GET_INFRACTIONS]: Map(),
    [GET_PARTICIPANTS]: Map(),
    [GET_SENTENCES]: Map(),
  },
  [INFRACTIONS_BY_PARTICIPANT]: Map(),
  [PARTICIPANTS]: List(),
  [SENTENCES_BY_PARTICIPANT]: Map(),
});

export default function studyReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
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

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(SENTENCES_BY_PARTICIPANT, value)
            .setIn([ACTIONS, GET_SENTENCES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(SENTENCES_BY_PARTICIPANT, List())
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
            .set(INFRACTIONS_BY_PARTICIPANT, value)
            .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(INFRACTIONS_BY_PARTICIPANT, List())
            .setIn([ERRORS, GET_INFRACTIONS], error)
            .setIn([ACTIONS, GET_INFRACTIONS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, GET_INFRACTIONS, seqAction.id]);
        },
      });
    }

    case findCommunityServiceSentences.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return findCommunityServiceSentences.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn([ACTIONS, FIND_COMMUNITY_SERVICE_SENTENCES, seqAction.id], fromJS(seqAction))
            .setIn([ACTIONS, FIND_COMMUNITY_SERVICE_SENTENCES, REQUEST_STATE], RequestStates.PENDING);
        },
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, FIND_COMMUNITY_SERVICE_SENTENCES, seqAction.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, FIND_COMMUNITY_SERVICE_SENTENCES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .setIn([ERRORS, FIND_COMMUNITY_SERVICE_SENTENCES], error)
            .setIn([ACTIONS, FIND_COMMUNITY_SERVICE_SENTENCES, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => {
          return state
            .deleteIn([ACTIONS, FIND_COMMUNITY_SERVICE_SENTENCES, seqAction.id]);
        },
      });
    }

    default:
      return state;
  }
}
