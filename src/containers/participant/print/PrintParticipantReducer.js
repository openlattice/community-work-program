// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { getInfoForPrintInfraction } from './PrintParticipantActions';
import { PRINT_PARTICIPANT } from '../../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  GET_INFO_FOR_PRINT_INFRACTION,
  REQUEST_STATE,
} = PRINT_PARTICIPANT;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_INFO_FOR_PRINT_INFRACTION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
});

export default function printParticipantReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case getInfoForPrintInfraction.case(action.type): {

      return getInfoForPrintInfraction.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, action.id], action)
          .setIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, action.id])
      });
    }

    default:
      return state;
  }
}
