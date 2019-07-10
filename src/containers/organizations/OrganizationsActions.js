/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ORGANIZATION :'ADD_ORGANIZATION' = 'ADD_ORGANIZATION';
const addOrganization :RequestSequence = newRequestSequence(ADD_ORGANIZATION);

const GET_ORGANIZATION :'GET_ORGANIZATION' = 'GET_ORGANIZATION';
const getOrganization :RequestSequence = newRequestSequence(GET_ORGANIZATION);

const GET_ORGANIZATIONS :'GET_ORGANIZATIONS' = 'GET_ORGANIZATIONS';
const getOrganizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS);

export {
  ADD_ORGANIZATION,
  GET_ORGANIZATION,
  GET_ORGANIZATIONS,
  addOrganization,
  getOrganization,
  getOrganizations,
};
