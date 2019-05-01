/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_ORGANIZATIONS :'GET_ORGANIZATIONS' = 'GET_ORGANIZATIONS';
const getOrganizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS);

const GET_ORGANIZATION_WORKSITES :'GET_ORGANIZATION_WORKSITES' = 'GET_ORGANIZATION_WORKSITES';
const getOrganizationWorksites :RequestSequence = newRequestSequence(GET_ORGANIZATION_WORKSITES);

export {
  GET_ORGANIZATIONS,
  GET_ORGANIZATION_WORKSITES,
  getOrganizations,
  getOrganizationWorksites,
};
