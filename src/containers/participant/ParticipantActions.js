// @flow
import { newRequestSequence } from 'redux-reqseq';

const GET_WARNINGS_VIOLATIONS_NOTE :'GET_WARNINGS_VIOLATIONS_NOTE' = 'GET_WARNINGS_VIOLATIONS_NOTE';
const getWarningsViolationsNote = newRequestSequence(GET_WARNINGS_VIOLATIONS_NOTE);

const GET_WARNINGS_VIOLATIONS_LIST :'GET_WARNINGS_VIOLATIONS_LIST' = 'GET_WARNINGS_VIOLATIONS_LIST';
const getWarningsViolationsList = newRequestSequence(GET_WARNINGS_VIOLATIONS_LIST);

export {
  GET_WARNINGS_VIOLATIONS_NOTE,
  GET_WARNINGS_VIOLATIONS_LIST,
  getWarningsViolationsNote,
  getWarningsViolationsList,
};
