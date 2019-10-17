/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ORGANIZATION :'ADD_ORGANIZATION' = 'ADD_ORGANIZATION';
const addOrganization :RequestSequence = newRequestSequence(ADD_ORGANIZATION);

const ADD_WORKSITE :'ADD_WORKSITE' = 'ADD_WORKSITE';
const addWorksite :RequestSequence = newRequestSequence(ADD_WORKSITE);

const ADD_WORKSITE_CONTACT_AND_ADDRESS :'ADD_WORKSITE_CONTACT_AND_ADDRESS' = 'ADD_WORKSITE_CONTACT_AND_ADDRESS';
const addWorksiteContactAndAddress :RequestSequence = newRequestSequence(ADD_WORKSITE_CONTACT_AND_ADDRESS);

const EDIT_WORKSITE :'EDIT_WORKSITE' = 'EDIT_WORKSITE';
const editWorksite :RequestSequence = newRequestSequence(EDIT_WORKSITE);

const GET_ORGANIZATIONS :'GET_ORGANIZATIONS' = 'GET_ORGANIZATIONS';
const getOrganizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS);

const GET_WORKSITE :'GET_WORKSITE' = 'GET_WORKSITE';
const getWorksite :RequestSequence = newRequestSequence(GET_WORKSITE);

const GET_WORKSITE_ADDRESS :'GET_WORKSITE_ADDRESS' = 'GET_WORKSITE_ADDRESS';
const getWorksiteAddress :RequestSequence = newRequestSequence(GET_WORKSITE_ADDRESS);

const GET_WORKSITE_CONTACT :'GET_WORKSITE_CONTACT' = 'GET_WORKSITE_CONTACT';
const getWorksiteContact :RequestSequence = newRequestSequence(GET_WORKSITE_CONTACT);

const GET_WORKSITES :'GET_WORKSITES' = 'GET_WORKSITES';
const getWorksites :RequestSequence = newRequestSequence(GET_WORKSITES);

const GET_WORKSITES_BY_ORG :'GET_WORKSITES_BY_ORG' = 'GET_WORKSITES_BY_ORG';
const getWorksitesByOrg :RequestSequence = newRequestSequence(GET_WORKSITES_BY_ORG);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

export {
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  ADD_WORKSITE_CONTACT_AND_ADDRESS,
  EDIT_WORKSITE,
  GET_ORGANIZATIONS,
  GET_WORKSITE,
  GET_WORKSITES,
  GET_WORKSITES_BY_ORG,
  GET_WORKSITE_ADDRESS,
  GET_WORKSITE_CONTACT,
  GET_WORKSITE_PLANS,
  addOrganization,
  addWorksite,
  addWorksiteContactAndAddress,
  editWorksite,
  getOrganizations,
  getWorksite,
  getWorksiteAddress,
  getWorksiteContact,
  getWorksitePlans,
  getWorksites,
  getWorksitesByOrg,
};
