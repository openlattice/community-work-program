/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const INITIALIZE_APPLICATION :'INITIALIZE_APPLICATION' = 'INITIALIZE_APPLICATION';
const initializeApplication :RequestSequence = newRequestSequence(INITIALIZE_APPLICATION);

const LOAD_APP :string = 'LOAD_APP';
const loadApp :RequestSequence = newRequestSequence(LOAD_APP);

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
function resetRequestState(actionType :string) {
  return {
    actionType,
    type: RESET_REQUEST_STATE,
  };
}

export {
  INITIALIZE_APPLICATION,
  LOAD_APP,
  RESET_REQUEST_STATE,
  initializeApplication,
  loadApp,
  resetRequestState,
};
