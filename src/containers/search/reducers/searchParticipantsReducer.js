// @flow
import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { SEARCH } from '../../../utils/constants/ReduxStateConsts';
import { SEARCH_PARTICIPANTS, searchParticipants } from '../actions';

const { SEARCHED_PARTICIPANTS, TOTAL_HITS } = SEARCH;
const { REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map, action :SequenceAction) {

  return searchParticipants.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_PARTICIPANTS, action.id], action),
    SUCCESS: () => state
      .set(SEARCHED_PARTICIPANTS, action.value.searchedParticipants)
      .set(TOTAL_HITS, action.value.totalHits)
      .setIn([SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([SEARCH_PARTICIPANTS, action.id]),
  });
}
