// @flow
import { newRequestSequence } from 'redux-reqseq';

const ADD_INFRACTION :'ADD_INFRACTION' = 'ADD_INFRACTION';
const addInfraction = newRequestSequence(ADD_INFRACTION);

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const ADD_ORIENTATION_DATE :'ADD_ORIENTATION_DATE' = 'ADD_ORIENTATION_DATE';
const addOrientationDate = newRequestSequence(ADD_ORIENTATION_DATE);

const ADD_WORKSITE_PLAN :'ADD_WORKSITE_PLAN' = 'ADD_WORKSITE_PLAN';
const addWorksitePlan = newRequestSequence(ADD_WORKSITE_PLAN);

const CHECK_IN_FOR_APPOINTMENT :'CHECK_IN_FOR_APPOINTMENT' = 'CHECK_IN_FOR_APPOINTMENT';
const checkInForAppointment = newRequestSequence(CHECK_IN_FOR_APPOINTMENT);

const CREATE_WORK_APPOINTMENTS :'CREATE_WORK_APPOINTMENTS' = 'CREATE_WORK_APPOINTMENTS';
const createWorkAppointments = newRequestSequence(CREATE_WORK_APPOINTMENTS);

const DELETE_APPOINTMENT :'DELETE_APPOINTMENT' = 'DELETE_APPOINTMENT';
const deleteAppointment = newRequestSequence(DELETE_APPOINTMENT);

const EDIT_APPOINTMENT:'EDIT_APPOINTMENT' = 'EDIT_APPOINTMENT';
const editAppointment = newRequestSequence(EDIT_APPOINTMENT);

const EDIT_CASE_AND_HOURS:'EDIT_CASE_AND_HOURS' = 'EDIT_CASE_AND_HOURS';
const editCaseAndHours = newRequestSequence(EDIT_CASE_AND_HOURS);

const EDIT_CHECK_IN_DATE:'EDIT_CHECK_IN_DATE' = 'EDIT_CHECK_IN_DATE';
const editCheckInDate = newRequestSequence(EDIT_CHECK_IN_DATE);

const EDIT_PLAN_NOTES:'EDIT_PLAN_NOTES' = 'EDIT_PLAN_NOTES';
const editPlanNotes = newRequestSequence(EDIT_PLAN_NOTES);

const EDIT_SENTENCE_DATE:'EDIT_SENTENCE_DATE' = 'EDIT_SENTENCE_DATE';
const editSentenceDate = newRequestSequence(EDIT_SENTENCE_DATE);

const EDIT_WORKSITE_PLAN:'EDIT_WORKSITE_PLAN' = 'EDIT_WORKSITE_PLAN';
const editWorksitePlan = newRequestSequence(EDIT_WORKSITE_PLAN);

const GET_APPOINTMENT_CHECK_INS :'GET_APPOINTMENT_CHECK_INS' = 'GET_APPOINTMENT_CHECK_INS';
const getAppointmentCheckIns = newRequestSequence(GET_APPOINTMENT_CHECK_INS);

const GET_ALL_PARTICIPANT_INFO :'GET_ALL_PARTICIPANT_INFO' = 'GET_ALL_PARTICIPANT_INFO';
const getAllParticipantInfo = newRequestSequence(GET_ALL_PARTICIPANT_INFO);

const GET_CASE_INFO :'GET_CASE_INFO' = 'GET_CASE_INFO';
const getCaseInfo = newRequestSequence(GET_CASE_INFO);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo = newRequestSequence(GET_CONTACT_INFO);

const GET_ENROLLMENT_STATUS :'GET_ENROLLMENT_STATUS' = 'GET_ENROLLMENT_STATUS';
const getEnrollmentStatus = newRequestSequence(GET_ENROLLMENT_STATUS);

const GET_INFO_FOR_PRINT_INFRACTION :'GET_INFO_FOR_PRINT_INFRACTION' = 'GET_INFO_FOR_PRINT_INFRACTION';
const getInfoForPrintInfraction = newRequestSequence(GET_INFO_FOR_PRINT_INFRACTION);

const GET_INFRACTION :'GET_INFRACTION' = 'GET_INFRACTION';
const getInfraction = newRequestSequence(GET_INFRACTION);

const GET_INFRACTION_TYPES :'GET_INFRACTION_TYPES' = 'GET_INFRACTION_TYPES';
const getInfractionTypes = newRequestSequence(GET_INFRACTION_TYPES);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant = newRequestSequence(GET_PARTICIPANT);

// const GET_PARTICIPANT_ADDRESS :'GET_PARTICIPANT_ADDRESS' = 'GET_PARTICIPANT_ADDRESS';
// const getParticipantAddress = newRequestSequence(GET_PARTICIPANT_ADDRESS);

const GET_PARTICIPANT_INFRACTIONS :'GET_PARTICIPANT_INFRACTIONS' = 'GET_PARTICIPANT_INFRACTIONS';
const getParticipantInfractions = newRequestSequence(GET_PARTICIPANT_INFRACTIONS);

const GET_PROGRAM_OUTCOME :'GET_PROGRAM_OUTCOME' = 'GET_PROGRAM_OUTCOME';
const getProgramOutcome = newRequestSequence(GET_PROGRAM_OUTCOME);

const GET_WORKSITE_BY_WORKSITE_PLAN :'GET_WORKSITE_BY_WORKSITE_PLAN' = 'GET_WORKSITE_BY_WORKSITE_PLAN';
const getWorksiteByWorksitePlan = newRequestSequence(GET_WORKSITE_BY_WORKSITE_PLAN);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans = newRequestSequence(GET_WORKSITE_PLANS);

const GET_WORKSITE_PLAN_STATUSES :'GET_WORKSITE_PLAN_STATUSES' = 'GET_WORKSITE_PLAN_STATUSES';
const getWorksitePlanStatuses = newRequestSequence(GET_WORKSITE_PLAN_STATUSES);

const GET_WORK_APPOINTMENTS :'GET_WORK_APPOINTMENTS' = 'GET_WORK_APPOINTMENTS';
const getWorkAppointments = newRequestSequence(GET_WORK_APPOINTMENTS);

const MARK_DIVERSION_PLAN_AS_COMPLETE :'MARK_DIVERSION_PLAN_AS_COMPLETE' = 'MARK_DIVERSION_PLAN_AS_COMPLETE';
const markDiversionPlanAsComplete = newRequestSequence(MARK_DIVERSION_PLAN_AS_COMPLETE);

const UPDATE_HOURS_WORKED :'UPDATE_HOURS_WORKED' = 'UPDATE_HOURS_WORKED';
const updateHoursWorked = newRequestSequence(UPDATE_HOURS_WORKED);

export {
  // GET_PARTICIPANT_ADDRESS,
  // getParticipantAddress,
  ADD_INFRACTION,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_ORIENTATION_DATE,
  ADD_WORKSITE_PLAN,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  EDIT_CASE_AND_HOURS,
  EDIT_CHECK_IN_DATE,
  EDIT_PLAN_NOTES,
  EDIT_SENTENCE_DATE,
  EDIT_WORKSITE_PLAN,
  GET_ALL_PARTICIPANT_INFO,
  GET_APPOINTMENT_CHECK_INS,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_PRINT_INFRACTION,
  GET_INFRACTION,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT,
  GET_PARTICIPANT_INFRACTIONS,
  GET_PROGRAM_OUTCOME,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  UPDATE_HOURS_WORKED,
  addInfraction,
  addNewDiversionPlanStatus,
  addOrientationDate,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  editCaseAndHours,
  editCheckInDate,
  editPlanNotes,
  editSentenceDate,
  editWorksitePlan,
  getAllParticipantInfo,
  getAppointmentCheckIns,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getInfoForPrintInfraction,
  getInfraction,
  getInfractionTypes,
  getParticipant,
  getParticipantInfractions,
  getProgramOutcome,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  markDiversionPlanAsComplete,
  updateHoursWorked,
};
