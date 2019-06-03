/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const INITIALIZE_APPLICATION :'INITIALIZE_APPLICATION' = 'INITIALIZE_APPLICATION';
const initializeApplication :RequestSequence = newRequestSequence(INITIALIZE_APPLICATION);

const LOAD_APP :string = 'LOAD_APP';
const loadApp :RequestSequence = newRequestSequence(LOAD_APP);

export {
  INITIALIZE_APPLICATION,
  initializeApplication,
  LOAD_APP,
  loadApp,
};
