// @flow

import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { SHARED, STATS } from '../../../../utils/constants/ReduxStateConsts';
import { GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, getRepeatParticipantsByCourtType } from '../CourtTypeActions';

const { REPEAT_PARTICIPANT_COUNTS_BY_COURT_TYPE } = STATS;
const { ACTIONS } = SHARED;

const { REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map, action :SequenceAction) {

  return getRepeatParticipantsByCourtType.reducer(state, action, {
    REQUEST: () => state
      .setIn([ACTIONS, GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ACTIONS, GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, action.id], action),
    SUCCESS: () => {
      const repeatParticipantCountsByCourtType :Map = action.value;
      return state
        .set(REPEAT_PARTICIPANT_COUNTS_BY_COURT_TYPE, repeatParticipantCountsByCourtType)
        .setIn([ACTIONS, GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, REQUEST_STATE], RequestStates.SUCCESS);
    },
    FAILURE: () => state.setIn([ACTIONS, GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([ACTIONS, GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, action.id]),
  });
}
