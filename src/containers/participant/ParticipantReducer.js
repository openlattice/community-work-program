// @flow
import isNumber from 'lodash/isNumber';
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  getCaseInfo,
  getContactInfo,
  getParticipant
} from './ParticipantActions';
import { PERSON } from '../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  CASE_NUMBER,
  EMAIL,
  ERRORS,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_PARTICIPANT,
  PARTICIPANT,
  PHONE,
  REQUEST_STATE,
} = PERSON;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_CASE_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [CASE_NUMBER]: List(),
  [EMAIL]: '',
  [ERRORS]: {
    [GET_CASE_INFO]: Map(),
    [GET_CONTACT_INFO]: Map(),
    [GET_PARTICIPANT]: Map(),
  },
  [PARTICIPANT]: Map(),
  [PHONE]: '',
});

export default function participantReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getParticipant.case(action.type): {

      const seqAction :SequenceAction = (action :any);

      return getParticipant.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PARTICIPANT, value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(PARTICIPANT, Map())
            .setIn([ERRORS, GET_PARTICIPANT], error)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT, seqAction.id])
      });
    }

    case getCaseInfo.case(action.type): {

      const seqAction :SequenceAction = (action :any);

      return getCaseInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CASE_INFO, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CASE_INFO, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(CASE_NUMBER, value)
            .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(CASE_NUMBER, List())
            .setIn([ERRORS, GET_CASE_INFO], error)
            .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CASE_INFO, seqAction.id])
      });
    }

    case getContactInfo.case(action.type): {

      const seqAction :SequenceAction = (action :any);

      return getContactInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CONTACT_INFO, seqAction.id], fromJS(seqAction))
          .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CONTACT_INFO, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(EMAIL, value.email)
            .set(PHONE, value.phone)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(EMAIL, '')
            .set(PHONE, '')
            .setIn([ERRORS, GET_CONTACT_INFO], error)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CONTACT_INFO, seqAction.id])
      });
    }

    default:
      return state;
  }
}
