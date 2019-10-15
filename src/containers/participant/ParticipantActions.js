// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_CHARGES_TO_CASE :'ADD_CHARGES_TO_CASE' = 'ADD_CHARGES_TO_CASE';
const addChargesToCase :RequestSequence = newRequestSequence(ADD_CHARGES_TO_CASE);

const ADD_INFRACTION :'ADD_INFRACTION' = 'ADD_INFRACTION';
const addInfraction :RequestSequence = newRequestSequence(ADD_INFRACTION);

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus :RequestSequence = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const ADD_NEW_PARTICIPANT_CONTACTS :'ADD_NEW_PARTICIPANT_CONTACTS' = 'ADD_NEW_PARTICIPANT_CONTACTS';
const addNewParticipantContacts :RequestSequence = newRequestSequence(ADD_NEW_PARTICIPANT_CONTACTS);

const ADD_TO_AVAILABLE_CHARGES :'ADD_TO_AVAILABLE_CHARGES' = 'ADD_TO_AVAILABLE_CHARGES';
const addToAvailableCharges :RequestSequence = newRequestSequence(ADD_TO_AVAILABLE_CHARGES);

const ADD_WORKSITE_PLAN :'ADD_WORKSITE_PLAN' = 'ADD_WORKSITE_PLAN';
const addWorksitePlan :RequestSequence = newRequestSequence(ADD_WORKSITE_PLAN);

const CHECK_IN_FOR_APPOINTMENT :'CHECK_IN_FOR_APPOINTMENT' = 'CHECK_IN_FOR_APPOINTMENT';
const checkInForAppointment :RequestSequence = newRequestSequence(CHECK_IN_FOR_APPOINTMENT);

const CREATE_WORK_APPOINTMENTS :'CREATE_WORK_APPOINTMENTS' = 'CREATE_WORK_APPOINTMENTS';
const createWorkAppointments :RequestSequence = newRequestSequence(CREATE_WORK_APPOINTMENTS);

const DELETE_APPOINTMENT :'DELETE_APPOINTMENT' = 'DELETE_APPOINTMENT';
const deleteAppointment :RequestSequence = newRequestSequence(DELETE_APPOINTMENT);

const EDIT_APPOINTMENT :'EDIT_APPOINTMENT' = 'EDIT_APPOINTMENT';
const editAppointment :RequestSequence = newRequestSequence(EDIT_APPOINTMENT);

const EDIT_ENROLLMENT_DATES :'EDIT_ENROLLMENT_DATES' = 'EDIT_ENROLLMENT_DATES';
const editEnrollmentDates :RequestSequence = newRequestSequence(EDIT_ENROLLMENT_DATES);

const EDIT_PARTICIPANT_CONTACTS :'EDIT_PARTICIPANT_CONTACTS' = 'EDIT_PARTICIPANT_CONTACTS';
const editParticipantContacts :RequestSequence = newRequestSequence(EDIT_PARTICIPANT_CONTACTS);

const EDIT_PERSON_CASE :'EDIT_PERSON_CASE' = 'EDIT_PERSON_CASE';
const editPersonCase :RequestSequence = newRequestSequence(EDIT_PERSON_CASE);

const EDIT_PERSON_DETAILS :'EDIT_PERSON_DETAILS' = 'EDIT_PERSON_DETAILS';
const editPersonDetails :RequestSequence = newRequestSequence(EDIT_PERSON_DETAILS);

const EDIT_PERSON_NOTES :'EDIT_PERSON_NOTES' = 'EDIT_PERSON_NOTES';
const editPersonNotes :RequestSequence = newRequestSequence(EDIT_PERSON_NOTES);

const EDIT_PLAN_NOTES :'EDIT_PLAN_NOTES' = 'EDIT_PLAN_NOTES';
const editPlanNotes :RequestSequence = newRequestSequence(EDIT_PLAN_NOTES);

const EDIT_REQUIRED_HOURS :'EDIT_REQUIRED_HOURS' = 'EDIT_REQUIRED_HOURS';
const editRequiredHours :RequestSequence = newRequestSequence(EDIT_REQUIRED_HOURS);

const EDIT_WORKSITE_PLAN :'EDIT_WORKSITE_PLAN' = 'EDIT_WORKSITE_PLAN';
const editWorksitePlan :RequestSequence = newRequestSequence(EDIT_WORKSITE_PLAN);

const GET_APPOINTMENT_CHECK_INS :'GET_APPOINTMENT_CHECK_INS' = 'GET_APPOINTMENT_CHECK_INS';
const getAppointmentCheckIns :RequestSequence = newRequestSequence(GET_APPOINTMENT_CHECK_INS);

const GET_ALL_PARTICIPANT_INFO :'GET_ALL_PARTICIPANT_INFO' = 'GET_ALL_PARTICIPANT_INFO';
const getAllParticipantInfo :RequestSequence = newRequestSequence(GET_ALL_PARTICIPANT_INFO);

const GET_CASE_INFO :'GET_CASE_INFO' = 'GET_CASE_INFO';
const getCaseInfo :RequestSequence = newRequestSequence(GET_CASE_INFO);

const GET_CHARGES :'GET_CHARGES' = 'GET_CHARGES';
const getCharges :RequestSequence = newRequestSequence(GET_CHARGES);

const GET_CHARGES_FOR_CASE :'GET_CHARGES_FOR_CASE' = 'GET_CHARGES_FOR_CASE';
const getChargesForCase :RequestSequence = newRequestSequence(GET_CHARGES_FOR_CASE);

const GET_CONTACT_INFO :'GET_CONTACT_INFO' = 'GET_CONTACT_INFO';
const getContactInfo :RequestSequence = newRequestSequence(GET_CONTACT_INFO);

const GET_ENROLLMENT_STATUS :'GET_ENROLLMENT_STATUS' = 'GET_ENROLLMENT_STATUS';
const getEnrollmentStatus :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUS);

const GET_INFO_FOR_EDIT_CASE :'GET_INFO_FOR_EDIT_CASE' = 'GET_INFO_FOR_EDIT_CASE';
const getInfoForEditCase :RequestSequence = newRequestSequence(GET_INFO_FOR_EDIT_CASE);

const GET_INFO_FOR_EDIT_PERSON :'GET_INFO_FOR_EDIT_PERSON' = 'GET_INFO_FOR_EDIT_PERSON';
const getInfoForEditPerson :RequestSequence = newRequestSequence(GET_INFO_FOR_EDIT_PERSON);

const GET_INFRACTION_TYPES :'GET_INFRACTION_TYPES' = 'GET_INFRACTION_TYPES';
const getInfractionTypes :RequestSequence = newRequestSequence(GET_INFRACTION_TYPES);

const GET_JUDGE_FOR_CASE :'GET_JUDGE_FOR_CASE' = 'GET_JUDGE_FOR_CASE';
const getJudgeForCase :RequestSequence = newRequestSequence(GET_JUDGE_FOR_CASE);

const GET_JUDGES :'GET_JUDGES' = 'GET_JUDGES';
const getJudges :RequestSequence = newRequestSequence(GET_JUDGES);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant :RequestSequence = newRequestSequence(GET_PARTICIPANT);

const GET_PARTICIPANT_ADDRESS :'GET_PARTICIPANT_ADDRESS' = 'GET_PARTICIPANT_ADDRESS';
const getParticipantAddress :RequestSequence = newRequestSequence(GET_PARTICIPANT_ADDRESS);

const GET_PARTICIPANT_INFRACTIONS :'GET_PARTICIPANT_INFRACTIONS' = 'GET_PARTICIPANT_INFRACTIONS';
const getParticipantInfractions :RequestSequence = newRequestSequence(GET_PARTICIPANT_INFRACTIONS);

const GET_PROGRAM_OUTCOME :'GET_PROGRAM_OUTCOME' = 'GET_PROGRAM_OUTCOME';
const getProgramOutcome :RequestSequence = newRequestSequence(GET_PROGRAM_OUTCOME);

const GET_WORKSITE_BY_WORKSITE_PLAN :'GET_WORKSITE_BY_WORKSITE_PLAN' = 'GET_WORKSITE_BY_WORKSITE_PLAN';
const getWorksiteByWorksitePlan :RequestSequence = newRequestSequence(GET_WORKSITE_BY_WORKSITE_PLAN);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

const GET_WORKSITE_PLAN_STATUSES :'GET_WORKSITE_PLAN_STATUSES' = 'GET_WORKSITE_PLAN_STATUSES';
const getWorksitePlanStatuses :RequestSequence = newRequestSequence(GET_WORKSITE_PLAN_STATUSES);

const GET_WORK_APPOINTMENTS :'GET_WORK_APPOINTMENTS' = 'GET_WORK_APPOINTMENTS';
const getWorkAppointments :RequestSequence = newRequestSequence(GET_WORK_APPOINTMENTS);

const MARK_DIVERSION_PLAN_AS_COMPLETE :'MARK_DIVERSION_PLAN_AS_COMPLETE' = 'MARK_DIVERSION_PLAN_AS_COMPLETE';
const markDiversionPlanAsComplete :RequestSequence = newRequestSequence(MARK_DIVERSION_PLAN_AS_COMPLETE);

const REASSIGN_JUDGE :'REASSIGN_JUDGE' = 'REASSIGN_JUDGE';
const reassignJudge :RequestSequence = newRequestSequence(REASSIGN_JUDGE);

const REMOVE_CHARGE_FROM_CASE :'REMOVE_CHARGE_FROM_CASE' = 'REMOVE_CHARGE_FROM_CASE';
const removeChargeFromCase :RequestSequence = newRequestSequence(REMOVE_CHARGE_FROM_CASE);

const UPDATE_HOURS_WORKED :'UPDATE_HOURS_WORKED' = 'UPDATE_HOURS_WORKED';
const updateHoursWorked :RequestSequence = newRequestSequence(UPDATE_HOURS_WORKED);

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
  GET_INFO_FOR_EDIT_PERSON,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_EDIT_CASE,
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
