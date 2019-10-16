// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_CHARGES_TO_CASE :'ADD_CHARGES_TO_CASE' = 'ADD_CHARGES_TO_CASE';
const addChargesToCase :RequestSequence = newRequestSequence(ADD_CHARGES_TO_CASE);

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus :RequestSequence = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const ADD_NEW_PARTICIPANT_CONTACTS :'ADD_NEW_PARTICIPANT_CONTACTS' = 'ADD_NEW_PARTICIPANT_CONTACTS';
const addNewParticipantContacts :RequestSequence = newRequestSequence(ADD_NEW_PARTICIPANT_CONTACTS);

const ADD_TO_AVAILABLE_CHARGES :'ADD_TO_AVAILABLE_CHARGES' = 'ADD_TO_AVAILABLE_CHARGES';
const addToAvailableCharges :RequestSequence = newRequestSequence(ADD_TO_AVAILABLE_CHARGES);

const CREATE_NEW_ENROLLMENT :'CREATE_NEW_ENROLLMENT' = 'CREATE_NEW_ENROLLMENT';
const createNewEnrollment = newRequestSequence(CREATE_NEW_ENROLLMENT);

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

const GET_ENROLLMENT_FROM_DIVERSION_PLAN :'GET_ENROLLMENT_FROM_DIVERSION_PLAN' = 'GET_ENROLLMENT_FROM_DIVERSION_PLAN';
const getEnrollmentFromDiversionPlan = newRequestSequence(GET_ENROLLMENT_FROM_DIVERSION_PLAN);

const GET_ENROLLMENT_STATUS :'GET_ENROLLMENT_STATUS' = 'GET_ENROLLMENT_STATUS';
const getEnrollmentStatus :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUS);

const GET_INFO_FOR_EDIT_CASE :'GET_INFO_FOR_EDIT_CASE' = 'GET_INFO_FOR_EDIT_CASE';
const getInfoForEditCase :RequestSequence = newRequestSequence(GET_INFO_FOR_EDIT_CASE);

const GET_INFO_FOR_EDIT_PERSON :'GET_INFO_FOR_EDIT_PERSON' = 'GET_INFO_FOR_EDIT_PERSON';
const getInfoForEditPerson :RequestSequence = newRequestSequence(GET_INFO_FOR_EDIT_PERSON);

const GET_JUDGE_FOR_CASE :'GET_JUDGE_FOR_CASE' = 'GET_JUDGE_FOR_CASE';
const getJudgeForCase :RequestSequence = newRequestSequence(GET_JUDGE_FOR_CASE);

const GET_JUDGES :'GET_JUDGES' = 'GET_JUDGES';
const getJudges :RequestSequence = newRequestSequence(GET_JUDGES);

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant :RequestSequence = newRequestSequence(GET_PARTICIPANT);

const GET_PARTICIPANT_ADDRESS :'GET_PARTICIPANT_ADDRESS' = 'GET_PARTICIPANT_ADDRESS';
const getParticipantAddress :RequestSequence = newRequestSequence(GET_PARTICIPANT_ADDRESS);

const GET_PARTICIPANT_CASES :'GET_PARTICIPANT_CASES' = 'GET_PARTICIPANT_CASES';
const getParticipantCases = newRequestSequence(GET_PARTICIPANT_CASES);

const GET_PROGRAM_OUTCOME :'GET_PROGRAM_OUTCOME' = 'GET_PROGRAM_OUTCOME';
const getProgramOutcome :RequestSequence = newRequestSequence(GET_PROGRAM_OUTCOME);

const MARK_DIVERSION_PLAN_AS_COMPLETE :'MARK_DIVERSION_PLAN_AS_COMPLETE' = 'MARK_DIVERSION_PLAN_AS_COMPLETE';
const markDiversionPlanAsComplete :RequestSequence = newRequestSequence(MARK_DIVERSION_PLAN_AS_COMPLETE);

const REASSIGN_JUDGE :'REASSIGN_JUDGE' = 'REASSIGN_JUDGE';
const reassignJudge :RequestSequence = newRequestSequence(REASSIGN_JUDGE);

const REMOVE_CHARGE_FROM_CASE :'REMOVE_CHARGE_FROM_CASE' = 'REMOVE_CHARGE_FROM_CASE';
const removeChargeFromCase :RequestSequence = newRequestSequence(REMOVE_CHARGE_FROM_CASE);

export {
  ADD_CHARGES_TO_CASE,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_NEW_PARTICIPANT_CONTACTS,
  ADD_TO_AVAILABLE_CHARGES,
  CREATE_NEW_ENROLLMENT,
  EDIT_ENROLLMENT_DATES,
  EDIT_PARTICIPANT_CONTACTS,
  EDIT_PERSON_CASE,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_REQUIRED_HOURS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CHARGES,
  GET_CHARGES_FOR_CASE,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_EDIT_CASE,
  GET_INFO_FOR_EDIT_PERSON,
  GET_JUDGES,
  GET_JUDGE_FOR_CASE,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_CASES,
  GET_PROGRAM_OUTCOME,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  REASSIGN_JUDGE,
  REMOVE_CHARGE_FROM_CASE,
  addChargesToCase,
  addNewDiversionPlanStatus,
  addNewParticipantContacts,
  addToAvailableCharges,
  createNewEnrollment,
  editEnrollmentDates,
  editParticipantContacts,
  editPersonCase,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editRequiredHours,
  getAllParticipantInfo,
  getCaseInfo,
  getCharges,
  getChargesForCase,
  getContactInfo,
  getEnrollmentFromDiversionPlan,
  getEnrollmentStatus,
  getInfoForEditCase,
  getInfoForEditPerson,
  getJudgeForCase,
  getJudges,
  getParticipant,
  getParticipantAddress,
  getParticipantCases,
  getProgramOutcome,
  markDiversionPlanAsComplete,
  reassignJudge,
  removeChargeFromCase,
};
