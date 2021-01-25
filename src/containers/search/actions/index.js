// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SEARCHED_DATA_AND_REQUEST_STATE
  :'CLEAR_SEARCHED_DATA_AND_REQUEST_STATE' = 'CLEAR_SEARCHED_DATA_AND_REQUEST_STATE';
const clearSearchedDataAndRequestState = () => ({
  type: CLEAR_SEARCHED_DATA_AND_REQUEST_STATE
});

const SEARCH_PARTICIPANTS :'SEARCH_PARTICIPANTS' = 'SEARCH_PARTICIPANTS';
const searchParticipants :RequestSequence = newRequestSequence(SEARCH_PARTICIPANTS);

export {
  CLEAR_SEARCHED_DATA_AND_REQUEST_STATE,
  SEARCH_PARTICIPANTS,
  clearSearchedDataAndRequestState,
  searchParticipants,
};
