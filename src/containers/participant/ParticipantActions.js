// @flow
import { newRequestSequence } from 'redux-reqseq';

const ADD_CHARGES_TO_CASE :'ADD_CHARGES_TO_CASE' = 'ADD_CHARGES_TO_CASE';
const addChargesToCase = newRequestSequence(ADD_CHARGES_TO_CASE);

const ADD_INFRACTION :'ADD_INFRACTION' = 'ADD_INFRACTION';
const addInfraction = newRequestSequence(ADD_INFRACTION);

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const ADD_NEW_PARTICIPANT_CONTACTS :'ADD_NEW_PARTICIPANT_CONTACTS' = 'ADD_NEW_PARTICIPANT_CONTACTS';
const addNewParticipantContacts = newRequestSequence(ADD_NEW_PARTICIPANT_CONTACTS);

const ADD_TO_AVAILABLE_CHARGES :'ADD_TO_AVAILABLE_CHARGES' = 'ADD_TO_AVAILABLE_CHARGES';
const addToAvailableCharges = newRequestSequence(ADD_TO_AVAILABLE_CHARGES);

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

const EDIT_ENROLLMENT_DATES:'EDIT_ENROLLMENT_DATES' = 'EDIT_ENROLLMENT_DATES';
const editEnrollmentDates = newRequestSequence(EDIT_ENROLLMENT_DATES);

const EDIT_PARTICIPANT_CONTACTS:'EDIT_PARTICIPANT_CONTACTS' = 'EDIT_PARTICIPANT_CONTACTS';
const editParticipantContacts = newRequestSequence(EDIT_PARTICIPANT_CONTACTS);

const EDIT_PERSON_CASE:'EDIT_PERSON_CASE' = 'EDIT_PERSON_CASE';
const editPersonCase = newRequestSequence(EDIT_PERSON_CASE);

const EDIT_PERSON_DETAILS:'EDIT_PERSON_DETAILS' = 'EDIT_PERSON_DETAILS';
const editPersonDetails = newRequestSequence(EDIT_PERSON_DETAILS);

const EDIT_PERSON_NOTES:'EDIT_PERSON_NOTES' = 'EDIT_PERSON_NOTES';
const editPersonNotes = newRequestSequence(EDIT_PERSON_NOTES);

const EDIT_PLAN_NOTES:'EDIT_PLAN_NOTES' = 'EDIT_PLAN_NOTES';
const editPlanNotes = newRequestSequence(EDIT_PLAN_NOTES);

const EDIT_REQUIRED_HOURS:'EDIT_REQUIRED_HOURS' = 'EDIT_REQUIRED_HOURS';
const editRequiredHours = newRequestSequence(EDIT_REQUIRED_HOURS);

const EDIT_WORKSITE_PLAN:'EDIT_WORKSITE_PLAN' = 'EDIT_WORKSITE_PLAN';
const editWorksitePlan = newRequestSequence(EDIT_WORKSITE_PLAN);

const GET_APPOINTMENT_CHECK_INS :'GET_APPOINTMENT_CHECK_INS' = 'GET_APPOINTMENT_CHECK_INS';
const getAppointmentCheckIns = newRequestSequence(GET_APPOINTMENT_CHECK_INS);

const GET_ALL_PARTICIPANT_INFO :'GET_ALL_PARTICIPANT_INFO' = 'GET_ALL_PARTICIPANT_INFO';
const getAllParticipantInfo = newRequestSequence(GET_ALL_PARTICIPANT_INFO);

const GET_CASE_INFO :'GET_CASE_INFO' = 'GET_CASE_INFO';
const getCaseInfo = newRequestSequence(GET_CASE_INFO);

const GET_CHARGES :'GET_CHARGES' = 'GET_CHARGES';
const getCharges = newRequestSequence(GET_CHARGES);

const GET_CHARGES_FOR_CASE :'GET_CHARGES_FOR_CASE' = 'GET_CHARGES_FOR_CASE';
const getChargesForCase = newRequestSequence(GET_CHARGES_FOR_CASE);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo = newRequestSequence(GET_CONTACT_INFO);

const GET_ENROLLMENT_FROM_DIVERSION_PLAN :'GET_ENROLLMENT_FROM_DIVERSION_PLAN' = 'GET_ENROLLMENT_FROM_DIVERSION_PLAN';
const getEnrollmentFromDiversionPlan = newRequestSequence(GET_ENROLLMENT_FROM_DIVERSION_PLAN);

const GET_ENROLLMENT_STATUS :'GET_ENROLLMENT_STATUS' = 'GET_ENROLLMENT_STATUS';
const getEnrollmentStatus = newRequestSequence(GET_ENROLLMENT_STATUS);

const GET_INFO_FOR_EDIT_CASE :'GET_INFO_FOR_EDIT_CASE' = 'GET_INFO_FOR_EDIT_CASE';
const getInfoForEditCase = newRequestSequence(GET_INFO_FOR_EDIT_CASE);

const GET_INFO_FOR_EDIT_PERSON :'GET_INFO_FOR_EDIT_PERSON' = 'GET_INFO_FOR_EDIT_PERSON';
const getInfoForEditPerson = newRequestSequence(GET_INFO_FOR_EDIT_PERSON);

const GET_INFRACTION_TYPES :'GET_INFRACTION_TYPES' = 'GET_INFRACTION_TYPES';
const getInfractionTypes = newRequestSequence(GET_INFRACTION_TYPES);

const GET_JUDGE_FOR_CASE :'GET_JUDGE_FOR_CASE' = 'GET_JUDGE_FOR_CASE';
const getJudgeForCase = newRequestSequence(GET_JUDGE_FOR_CASE);

const GET_JUDGES:'GET_JUDGES' = 'GET_JUDGES';
const getJudges = newRequestSequence(GET_JUDGES);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant = newRequestSequence(GET_PARTICIPANT);

const GET_PARTICIPANT_ADDRESS :'GET_PARTICIPANT_ADDRESS' = 'GET_PARTICIPANT_ADDRESS';
const getParticipantAddress = newRequestSequence(GET_PARTICIPANT_ADDRESS);

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

const REASSIGN_JUDGE:'REASSIGN_JUDGE' = 'REASSIGN_JUDGE';
const reassignJudge = newRequestSequence(REASSIGN_JUDGE);

const REMOVE_CHARGE_FROM_CASE:'REMOVE_CHARGE_FROM_CASE' = 'REMOVE_CHARGE_FROM_CASE';
const removeChargeFromCase = newRequestSequence(REMOVE_CHARGE_FROM_CASE);

const UPDATE_HOURS_WORKED :'UPDATE_HOURS_WORKED' = 'UPDATE_HOURS_WORKED';
const updateHoursWorked = newRequestSequence(UPDATE_HOURS_WORKED);

export {
  ADD_CHARGES_TO_CASE,
  ADD_INFRACTION,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_NEW_PARTICIPANT_CONTACTS,
  ADD_TO_AVAILABLE_CHARGES,
  ADD_WORKSITE_PLAN,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  EDIT_ENROLLMENT_DATES,
  EDIT_PARTICIPANT_CONTACTS,
  EDIT_PERSON_CASE,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_REQUIRED_HOURS,
  EDIT_WORKSITE_PLAN,
  GET_ALL_PARTICIPANT_INFO,
  GET_APPOINTMENT_CHECK_INS,
  GET_CASE_INFO,
  GET_CHARGES,
  GET_CHARGES_FOR_CASE,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_EDIT_CASE,
  GET_INFO_FOR_EDIT_PERSON,
  GET_INFRACTION_TYPES,
  GET_JUDGES,
  GET_JUDGE_FOR_CASE,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_PROGRAM_OUTCOME,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  REASSIGN_JUDGE,
  REMOVE_CHARGE_FROM_CASE,
  UPDATE_HOURS_WORKED,
  addChargesToCase,
  addInfraction,
  addNewDiversionPlanStatus,
  addNewParticipantContacts,
  addToAvailableCharges,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  editEnrollmentDates,
  editParticipantContacts,
  editPersonCase,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editRequiredHours,
  editWorksitePlan,
  getAllParticipantInfo,
  getAppointmentCheckIns,
  getCaseInfo,
  getCharges,
  getChargesForCase,
  getContactInfo,
  getEnrollmentFromDiversionPlan,
  getEnrollmentStatus,
  getInfoForEditCase,
  getInfoForEditPerson,
  getInfractionTypes,
  getJudgeForCase,
  getJudges,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getProgramOutcome,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  markDiversionPlanAsComplete,
  reassignJudge,
  removeChargeFromCase,
  updateHoursWorked,
};
