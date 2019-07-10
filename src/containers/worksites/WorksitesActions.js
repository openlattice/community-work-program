/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_WORKSITE :'ADD_WORKSITE' = 'ADD_WORKSITE';
const addWorksite :RequestSequence = newRequestSequence(ADD_WORKSITE);

const GET_WORKSITES :'GET_WORKSITES' = 'GET_WORKSITES';
const getWorksites :RequestSequence = newRequestSequence(GET_WORKSITES);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

export {
  ADD_WORKSITE,
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  addWorksite,
  getWorksitePlans,
  getWorksites,
};
