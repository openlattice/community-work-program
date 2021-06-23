// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EDIT_PROGRAM_OUTCOME :'EDIT_PROGRAM_OUTCOME' = 'EDIT_PROGRAM_OUTCOME';
const editProgramOutcome :RequestSequence = newRequestSequence(EDIT_PROGRAM_OUTCOME);

export {
  EDIT_PROGRAM_OUTCOME,
  editProgramOutcome,
};
