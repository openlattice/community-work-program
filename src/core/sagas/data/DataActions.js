/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SUBMIT_DATA_GRAPH :'SUBMIT_DATA_GRAPH' = 'SUBMIT_DATA_GRAPH';
const submitDataGraph :RequestSequence = newRequestSequence(SUBMIT_DATA_GRAPH);

export {
  SUBMIT_DATA_GRAPH,
  submitDataGraph,
};
