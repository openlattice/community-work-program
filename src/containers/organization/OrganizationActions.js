/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_ORGANIZATION :'GET_ORGANIZATION' = 'GET_ORGANIZATION';
const getOrganization :RequestSequence = newRequestSequence(GET_ORGANIZATION);

export {
  GET_ORGANIZATION,
  getOrganization,
};
