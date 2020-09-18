// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const RESET_SEARCHED_PARTICIPANTS :'RESET_SEARCHED_PARTICIPANTS' = 'RESET_SEARCHED_PARTICIPANTS';
const resetSearchedParticipants = () => ({
  type: RESET_SEARCHED_PARTICIPANTS
});

const SEARCH_EXISTING_PEOPLE :'SEARCH_EXISTING_PEOPLE' = 'SEARCH_EXISTING_PEOPLE';
const searchExistingPeople :RequestSequence = newRequestSequence(SEARCH_EXISTING_PEOPLE);

const SELECT_EXISTING_PERSON :'SELECT_EXISTING_PERSON' = 'SELECT_EXISTING_PERSON';
const selectExistingPerson :RequestSequence = newRequestSequence(SELECT_EXISTING_PERSON);

export {
  RESET_SEARCHED_PARTICIPANTS,
  SEARCH_EXISTING_PEOPLE,
  SELECT_EXISTING_PERSON,
  resetSearchedParticipants,
  searchExistingPeople,
  selectExistingPerson,
};
