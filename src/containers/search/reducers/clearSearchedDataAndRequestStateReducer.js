// @flow

import { List, Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import { SEARCH } from '../../../utils/constants/ReduxStateConsts';
import { SEARCH_PARTICIPANTS } from '../actions';

const { SEARCHED_PARTICIPANTS, TOTAL_HITS } = SEARCH;

const { REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map) {
  return state
    .set(SEARCHED_PARTICIPANTS, List())
    .set(TOTAL_HITS, 0)
    .setIn([SEARCH_PARTICIPANTS, REQUEST_STATE], RequestStates.STANDBY);
}
