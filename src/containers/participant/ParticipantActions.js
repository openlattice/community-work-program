// @flow
import { newRequestSequence } from 'redux-reqseq';

const ADD_INFRACTION :'ADD_INFRACTION' = 'ADD_INFRACTION';
const addInfraction = newRequestSequence(ADD_INFRACTION);

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const ADD_WORKSITE_PLAN :'ADD_WORKSITE_PLAN' = 'ADD_WORKSITE_PLAN';
const addWorksitePlan = newRequestSequence(ADD_WORKSITE_PLAN);

const CHECK_IN_FOR_APPOINTMENT:'CHECK_IN_FOR_APPOINTMENT' = 'CHECK_IN_FOR_APPOINTMENT';
const checkInForAppointment = newRequestSequence(CHECK_IN_FOR_APPOINTMENT);

const CREATE_WORK_APPOINTMENTS:'CREATE_WORK_APPOINTMENTS' = 'CREATE_WORK_APPOINTMENTS';
const createWorkAppointments = newRequestSequence(CREATE_WORK_APPOINTMENTS);

const GET_APPOINTMENT_CHECK_INS :'GET_APPOINTMENT_CHECK_INS' = 'GET_APPOINTMENT_CHECK_INS';
const getAppointmentCheckIns = newRequestSequence(GET_APPOINTMENT_CHECK_INS);

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

const GET_INFRACTION_TYPES :'GET_INFRACTION_TYPES' = 'GET_INFRACTION_TYPES';
const getInfractionTypes = newRequestSequence(GET_INFRACTION_TYPES);

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

const GET_WORK_APPOINTMENTS :'GET_WORK_APPOINTMENTS' = 'GET_WORK_APPOINTMENTS';
const getWorkAppointments = newRequestSequence(GET_WORK_APPOINTMENTS);

const UPDATE_HOURS_WORKED :'UPDATE_HOURS_WORKED' = 'UPDATE_HOURS_WORKED';
const updateHoursWorked = newRequestSequence(UPDATE_HOURS_WORKED);

export {
  ADD_INFRACTION,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_WORKSITE_PLAN,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  GET_ALL_PARTICIPANT_INFO,
  GET_APPOINTMENT_CHECK_INS,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_REQUIRED_HOURS,
  GET_SENTENCE_TERM,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORK_APPOINTMENTS,
  UPDATE_HOURS_WORKED,
  addInfraction,
  addNewDiversionPlanStatus,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  getAllParticipantInfo,
  getAppointmentCheckIns,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getInfractionTypes,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getRequiredHours,
  getSentenceTerm,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlans,
  updateHoursWorked,
};
