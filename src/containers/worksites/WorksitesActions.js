/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ORGANIZATION :'ADD_ORGANIZATION' = 'ADD_ORGANIZATION';
const addOrganization :RequestSequence = newRequestSequence(ADD_ORGANIZATION);

const ADD_WORKSITE :'ADD_WORKSITE' = 'ADD_WORKSITE';
const addWorksite :RequestSequence = newRequestSequence(ADD_WORKSITE);

const ADD_WORKSITE_ADDRESS :'ADD_WORKSITE_ADDRESS' = 'ADD_WORKSITE_ADDRESS';
const addWorksiteAddress :RequestSequence = newRequestSequence(ADD_WORKSITE_ADDRESS);

const ADD_WORKSITE_CONTACTS :'ADD_WORKSITE_CONTACTS' = 'ADD_WORKSITE_CONTACTS';
const addWorksiteContacts :RequestSequence = newRequestSequence(ADD_WORKSITE_CONTACTS);

const CREATE_WORKSITE_SCHEDULE :'CREATE_WORKSITE_SCHEDULE' = 'CREATE_WORKSITE_SCHEDULE';
const createWorksiteSchedule :RequestSequence = newRequestSequence(CREATE_WORKSITE_SCHEDULE);

const DELETE_WORKSITE_CONTACT :'DELETE_WORKSITE_CONTACT' = 'DELETE_WORKSITE_CONTACT';
const deleteWorksiteContact :RequestSequence = newRequestSequence(DELETE_WORKSITE_CONTACT);

const EDIT_WORKSITE :'EDIT_WORKSITE' = 'EDIT_WORKSITE';
const editWorksite :RequestSequence = newRequestSequence(EDIT_WORKSITE);

const EDIT_WORKSITE_ADDRESS :'EDIT_WORKSITE_ADDRESS' = 'EDIT_WORKSITE_ADDRESS';
const editWorksiteAddress :RequestSequence = newRequestSequence(EDIT_WORKSITE_ADDRESS);

const EDIT_WORKSITE_CONTACT :'EDIT_WORKSITE_CONTACT' = 'EDIT_WORKSITE_CONTACT';
const editWorksiteContact :RequestSequence = newRequestSequence(EDIT_WORKSITE_CONTACT);

const GET_ORGANIZATIONS :'GET_ORGANIZATIONS' = 'GET_ORGANIZATIONS';
const getOrganizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS);

const GET_WORKSITE :'GET_WORKSITE' = 'GET_WORKSITE';
const getWorksite :RequestSequence = newRequestSequence(GET_WORKSITE);

const GET_WORKSITE_ADDRESS :'GET_WORKSITE_ADDRESS' = 'GET_WORKSITE_ADDRESS';
const getWorksiteAddress :RequestSequence = newRequestSequence(GET_WORKSITE_ADDRESS);

const GET_WORKSITE_CONTACTS :'GET_WORKSITE_CONTACTS' = 'GET_WORKSITE_CONTACTS';
const getWorksiteContacts :RequestSequence = newRequestSequence(GET_WORKSITE_CONTACTS);

const GET_WORKSITE_SCHEDULE :'GET_WORKSITE_SCHEDULE' = 'GET_WORKSITE_SCHEDULE';
const getWorksiteSchedule :RequestSequence = newRequestSequence(GET_WORKSITE_SCHEDULE);

const GET_WORKSITES :'GET_WORKSITES' = 'GET_WORKSITES';
const getWorksites :RequestSequence = newRequestSequence(GET_WORKSITES);

const GET_WORKSITES_BY_ORG :'GET_WORKSITES_BY_ORG' = 'GET_WORKSITES_BY_ORG';
const getWorksitesByOrg :RequestSequence = newRequestSequence(GET_WORKSITES_BY_ORG);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

export {
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  ADD_WORKSITE_ADDRESS,
  ADD_WORKSITE_CONTACTS,
  CREATE_WORKSITE_SCHEDULE,
  DELETE_WORKSITE_CONTACT,
  EDIT_WORKSITE,
  EDIT_WORKSITE_ADDRESS,
  EDIT_WORKSITE_CONTACT,
  GET_ORGANIZATIONS,
  GET_WORKSITE,
  GET_WORKSITES,
  GET_WORKSITES_BY_ORG,
  GET_WORKSITE_ADDRESS,
  GET_WORKSITE_CONTACTS,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_SCHEDULE,
  addOrganization,
  addWorksite,
  addWorksiteAddress,
  addWorksiteContacts,
  createWorksiteSchedule,
  deleteWorksiteContact,
  editWorksite,
  editWorksiteAddress,
  editWorksiteContact,
  getOrganizations,
  getWorksite,
  getWorksiteAddress,
  getWorksiteContacts,
  getWorksitePlans,
  getWorksiteSchedule,
  getWorksites,
  getWorksitesByOrg,
};
