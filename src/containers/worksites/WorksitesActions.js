/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_WORKSITES :'GET_WORKSITES' = 'GET_WORKSITES';
const getWorksites :RequestSequence = newRequestSequence(GET_WORKSITES);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

export {
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  getWorksitePlans,
  getWorksites,
};
