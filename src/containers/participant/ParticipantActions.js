// @flow
import { newRequestSequence } from 'redux-reqseq';

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const GET_ALL_PARTICIPANT_INFO :'GET_ALL_PARTICIPANT_INFO' = 'GET_ALL_PARTICIPANT_INFO';
const getAllParticipantInfo = newRequestSequence(GET_ALL_PARTICIPANT_INFO);

const GET_CASE_INFO :'GET_CASE_INFO' = 'GET_CASE_INFO';
const getCaseInfo = newRequestSequence(GET_CASE_INFO);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo = newRequestSequence(GET_CONTACT_INFO);

const GET_REQUIRED_HOURS :'GET_REQUIRED_HOURS' = 'GET_REQUIRED_HOURS';
const getRequiredHours = newRequestSequence(GET_REQUIRED_HOURS);

const GET_ENROLLMENT_STATUS :'GET_ENROLLMENT_STATUS' = 'GET_ENROLLMENT_STATUS';
const getEnrollmentStatus = newRequestSequence(GET_ENROLLMENT_STATUS);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant = newRequestSequence(GET_PARTICIPANT);

const GET_PARTICIPANT_ADDRESS :'GET_PARTICIPANT_ADDRESS' = 'GET_PARTICIPANT_ADDRESS';
const getParticipantAddress = newRequestSequence(GET_PARTICIPANT_ADDRESS);

const GET_PARTICIPANT_INFRACTIONS :'GET_PARTICIPANT_INFRACTIONS' = 'GET_PARTICIPANT_INFRACTIONS';
const getParticipantInfractions = newRequestSequence(GET_PARTICIPANT_INFRACTIONS);

const GET_SENTENCE_TERM :'GET_SENTENCE_TERM' = 'GET_SENTENCE_TERM';
const getSentenceTerm = newRequestSequence(GET_SENTENCE_TERM);

const GET_WORKSITE_BY_WORKSITE_PLAN :'GET_WORKSITE_BY_WORKSITE_PLAN' = 'GET_WORKSITE_BY_WORKSITE_PLAN';
const getWorksiteByWorksitePlan = newRequestSequence(GET_WORKSITE_BY_WORKSITE_PLAN);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans = newRequestSequence(GET_WORKSITE_PLANS);


export {
  ADD_NEW_DIVERSION_PLAN_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_REQUIRED_HOURS,
  GET_SENTENCE_TERM,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  addNewDiversionPlanStatus,
  getAllParticipantInfo,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getRequiredHours,
  getSentenceTerm,
  getWorksiteByWorksitePlan,
  getWorksitePlans,
};
