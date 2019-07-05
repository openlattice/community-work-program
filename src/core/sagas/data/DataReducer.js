// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { submitDataGraph } from './DataActions';
import { DATA } from '../../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  ERRORS,
  REQUEST_STATE,
  SUBMIT_DATA_GRAPH,
} = DATA;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [SUBMIT_DATA_GRAPH]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [ERRORS]: {
    [SUBMIT_DATA_GRAPH]: Map(),
  }
});

export default function dataReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case submitDataGraph.case(action.type): {

      return submitDataGraph.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, SUBMIT_DATA_GRAPH, action.id], fromJS(action))
          .setIn([ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, SUBMIT_DATA_GRAPH, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, SUBMIT_DATA_GRAPH, action.id]),
      });
    }

    default:
      return state;
  }
}
