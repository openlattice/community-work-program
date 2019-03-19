/*
 * @flow
 */

import isNumber from 'lodash/isNumber';
import { List, Map, fromJS } from 'immutable';

import {
  getParticipants,
} from './ParticipantsActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  actions: {
    getParticipants: Map(),
  },
  isFetchingParticipants: false,
  participants: List(),
});

export default function studyReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getParticipants.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getParticipants.reducer(state, action, {

        REQUEST: () => {
          return state
            .setIn(['actions', 'getParticipants', seqAction.id], fromJS(seqAction))
            .set('isFetchingParticipants', true);
        },
        SUCCESS: () => {

          if (!state.hasIn(['actions', 'getParticipants', seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state.set('participants', value);
        },
        FAILURE: () => {

          const error = {};
          /*
           * value is expected to be an error object. for lattice-sagas / lattice-js, the error object is expected
           * to be the Axios error object. for more info:
           *   https://github.com/axios/axios#handling-errors
           */
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set('participants', List())
            .setIn(['errors', 'getParticipants'], error);
        },
        FINALLY: () => {
          return state
            .deleteIn(['actions', 'getParticipants', seqAction.id])
            .set('isFetchingParticipants', false);
        },
      });
    }

    default:
      return state;
  }
}
