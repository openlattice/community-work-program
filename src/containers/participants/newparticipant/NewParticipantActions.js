// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SEARCH_EXISTING_PEOPLE :'SEARCH_EXISTING_PEOPLE' = 'SEARCH_EXISTING_PEOPLE';
const searchExistingPeople :RequestSequence = newRequestSequence(SEARCH_EXISTING_PEOPLE);

const SELECT_EXISTING_PERSON :'SELECT_EXISTING_PERSON' = 'SELECT_EXISTING_PERSON';
const selectExistingPerson :RequestSequence = newRequestSequence(SELECT_EXISTING_PERSON);

export {
  SEARCH_EXISTING_PEOPLE,
  SELECT_EXISTING_PERSON,
  searchExistingPeople,
  selectExistingPerson,
};
