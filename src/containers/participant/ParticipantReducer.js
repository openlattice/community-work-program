// @flow
import isNumber from 'lodash/isNumber';
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  getParticipant
} from './ParticipantActions';
import { PERSON } from '../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  ERRORS,
  GET_PARTICIPANT,
  PARTICIPANT,
  REQUEST_STATE,
} = PERSON;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ERRORS]: {
    [GET_PARTICIPANT]: Map(),
  },
  [PARTICIPANT]: Map(),
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

    default:
      return state;
  }
}
