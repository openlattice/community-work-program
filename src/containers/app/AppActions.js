/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const INITIALIZE_APPLICATION :'INITIALIZE_APPLICATION' = 'INITIALIZE_APPLICATION';
const initializeApplication :RequestSequence = newRequestSequence(INITIALIZE_APPLICATION);

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
function resetRequestState(actionType :string) {
  return {
    actionType,
    type: RESET_REQUEST_STATE,
  };
}

const SWITCH_ORGANIZATION :string = 'SWITCH_ORGANIZATION';
const switchOrganization = (org :Object) :Object => ({
  org,
  type: SWITCH_ORGANIZATION
});

export {
  INITIALIZE_APPLICATION,
  RESET_REQUEST_STATE,
  SWITCH_ORGANIZATION,
  initializeApplication,
  resetRequestState,
  switchOrganization,
};
