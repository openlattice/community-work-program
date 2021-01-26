// @flow
import { List, Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import clearSearchedDataAndRequestStateReducer from './clearSearchedDataAndRequestStateReducer';
import searchParticipantsReducer from './searchParticipantsReducer';

import { SEARCH } from '../../../utils/constants/ReduxStateConsts';
import { CLEAR_SEARCHED_DATA_AND_REQUEST_STATE, SEARCH_PARTICIPANTS, searchParticipants } from '../actions';

const { SEARCHED_PARTICIPANTS, TOTAL_HITS } = SEARCH;
const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  // actions
  [SEARCH_PARTICIPANTS]: {
    [REQUEST_STATE]: RequestStates.STANDBY
  },
  // data
  [SEARCHED_PARTICIPANTS]: List(),
  [TOTAL_HITS]: 0,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCHED_DATA_AND_REQUEST_STATE: {
      return clearSearchedDataAndRequestStateReducer(state);
    }

    case searchParticipants.case(action.type): {
      return searchParticipantsReducer(state, action);
    }

    default:
      return state;
  }
}
