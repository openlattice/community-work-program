// @flow
import { newRequestSequence } from 'redux-reqseq';

const GET_CASE_INFO :'GET_CASE_INFO' = 'GET_CASE_INFO';
const getCaseInfo = newRequestSequence(GET_CASE_INFO);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo = newRequestSequence(GET_CONTACT_INFO);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant = newRequestSequence(GET_PARTICIPANT);

export {
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_PARTICIPANT,
  getCaseInfo,
  getContactInfo,
  getParticipant,
};
