// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SEARCH_EXISTING_PEOPLE :'SEARCH_EXISTING_PEOPLE' = 'SEARCH_EXISTING_PEOPLE';
const searchExistingPeople :RequestSequence = newRequestSequence(SEARCH_EXISTING_PEOPLE);

export {
  SEARCH_EXISTING_PEOPLE,
  searchExistingPeople,
};
