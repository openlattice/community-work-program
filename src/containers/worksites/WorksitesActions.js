/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ORGANIZATION :'ADD_ORGANIZATION' = 'ADD_ORGANIZATION';
const addOrganization :RequestSequence = newRequestSequence(ADD_ORGANIZATION);

const ADD_WORKSITE :'ADD_WORKSITE' = 'ADD_WORKSITE';
const addWorksite :RequestSequence = newRequestSequence(ADD_WORKSITE);

const GET_ORGANIZATION :'GET_ORGANIZATION' = 'GET_ORGANIZATION';
const getOrganization :RequestSequence = newRequestSequence(GET_ORGANIZATION);

const GET_ORGANIZATIONS :'GET_ORGANIZATIONS' = 'GET_ORGANIZATIONS';
const getOrganizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS);

const GET_WORKSITES_BY_ORG :'GET_WORKSITES_BY_ORG' = 'GET_WORKSITES_BY_ORG';
const getWorksitesByOrg :RequestSequence = newRequestSequence(GET_WORKSITES_BY_ORG);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

export {
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  GET_ORGANIZATION,
  GET_ORGANIZATIONS,
  GET_WORKSITES_BY_ORG,
  GET_WORKSITE_PLANS,
  addOrganization,
  addWorksite,
  getOrganization,
  getOrganizations,
  getWorksitePlans,
  getWorksitesByOrg,
};
