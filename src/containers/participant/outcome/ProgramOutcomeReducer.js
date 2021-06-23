// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { EDIT_PROGRAM_OUTCOME, editProgramOutcome } from './ProgramOutcomeActions';

import { SHARED } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS } = SHARED;
const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [EDIT_PROGRAM_OUTCOME]: { [REQUEST_STATE]: RequestStates.STANDBY },
  },
});

export default function reducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {
  switch (action.type) {

    case editProgramOutcome.case(action.type): {
      return editProgramOutcome.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PROGRAM_OUTCOME, action.id], action)
          .setIn([ACTIONS, EDIT_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([ACTIONS, EDIT_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PROGRAM_OUTCOME, action.id])
      });
    }

    default:
      return state;
  }
}
