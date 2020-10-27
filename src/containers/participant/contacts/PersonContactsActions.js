// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_PERSON_ADDRESS :'ADD_PERSON_ADDRESS' = 'ADD_PERSON_ADDRESS';
const addPersonAddress :RequestSequence = newRequestSequence(ADD_PERSON_ADDRESS);

const ADD_PERSON_EMAIL :'ADD_PERSON_EMAIL' = 'ADD_PERSON_EMAIL';
const addPersonEmail :RequestSequence = newRequestSequence(ADD_PERSON_EMAIL);

const ADD_PERSON_PHONE :'ADD_PERSON_PHONE' = 'ADD_PERSON_PHONE';
const addPersonPhone :RequestSequence = newRequestSequence(ADD_PERSON_PHONE);

const EDIT_PERSON_ADDRESS :'EDIT_PERSON_ADDRESS' = 'EDIT_PERSON_ADDRESS';
const editPersonAddress :RequestSequence = newRequestSequence(EDIT_PERSON_ADDRESS);

const EDIT_PERSON_EMAIL :'EDIT_PERSON_EMAIL' = 'EDIT_PERSON_EMAIL';
const editPersonEmail :RequestSequence = newRequestSequence(EDIT_PERSON_EMAIL);

const EDIT_PERSON_PHONE :'EDIT_PERSON_PHONE' = 'EDIT_PERSON_PHONE';
const editPersonPhone :RequestSequence = newRequestSequence(EDIT_PERSON_PHONE);

const GET_PERSON_ADDRESS :'GET_PERSON_ADDRESS' = 'GET_PERSON_ADDRESS';
const getPersonAddress :RequestSequence = newRequestSequence(GET_PERSON_ADDRESS);

const GET_PERSON_CONTACT_INFO :'GET_PERSON_CONTACT_INFO' = 'GET_PERSON_CONTACT_INFO';
const getPersonContactInfo :RequestSequence = newRequestSequence(GET_PERSON_CONTACT_INFO);

export {
  ADD_PERSON_ADDRESS,
  ADD_PERSON_EMAIL,
  ADD_PERSON_PHONE,
  EDIT_PERSON_ADDRESS,
  EDIT_PERSON_EMAIL,
  EDIT_PERSON_PHONE,
  GET_PERSON_ADDRESS,
  GET_PERSON_CONTACT_INFO,
  addPersonAddress,
  addPersonEmail,
  addPersonPhone,
  editPersonAddress,
  editPersonEmail,
  editPersonPhone,
  getPersonAddress,
  getPersonContactInfo,
};
