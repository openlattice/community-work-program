// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_NEW_DIVERSION_PLAN_STATUS :'ADD_NEW_DIVERSION_PLAN_STATUS' = 'ADD_NEW_DIVERSION_PLAN_STATUS';
const addNewDiversionPlanStatus :RequestSequence = newRequestSequence(ADD_NEW_DIVERSION_PLAN_STATUS);

const ADD_PERSON_PHOTO :'ADD_PERSON_PHOTO' = 'ADD_PERSON_PHOTO';
const addPersonPhoto :RequestSequence = newRequestSequence(ADD_PERSON_PHOTO);

const CREATE_CASE :'CREATE_CASE' = 'CREATE_CASE';
const createCase :RequestSequence = newRequestSequence(CREATE_CASE);

const CREATE_NEW_ENROLLMENT :'CREATE_NEW_ENROLLMENT' = 'CREATE_NEW_ENROLLMENT';
const createNewEnrollment :RequestSequence = newRequestSequence(CREATE_NEW_ENROLLMENT);

const EDIT_ENROLLMENT_DATES :'EDIT_ENROLLMENT_DATES' = 'EDIT_ENROLLMENT_DATES';
const editEnrollmentDates :RequestSequence = newRequestSequence(EDIT_ENROLLMENT_DATES);

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

const GET_DIVERSION_PLAN :'GET_DIVERSION_PLAN' = 'GET_DIVERSION_PLAN';
const getDiversionPlan :RequestSequence = newRequestSequence(GET_DIVERSION_PLAN);

const GET_ENROLLMENT_HISTORY :'GET_ENROLLMENT_HISTORY' = 'GET_ENROLLMENT_HISTORY';
const getEnrollmentHistory :RequestSequence = newRequestSequence(GET_ENROLLMENT_HISTORY);

const GET_ENROLLMENT_FROM_DIVERSION_PLAN :'GET_ENROLLMENT_FROM_DIVERSION_PLAN' = 'GET_ENROLLMENT_FROM_DIVERSION_PLAN';
const getEnrollmentFromDiversionPlan :RequestSequence = newRequestSequence(GET_ENROLLMENT_FROM_DIVERSION_PLAN);

const GET_ENROLLMENT_STATUS :'GET_ENROLLMENT_STATUS' = 'GET_ENROLLMENT_STATUS';
const getEnrollmentStatus :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUS);

const GET_INFO_FOR_ADD_PARTICIPANT :'GET_INFO_FOR_ADD_PARTICIPANT' = 'GET_INFO_FOR_ADD_PARTICIPANT';
const getInfoForAddParticipant :RequestSequence = newRequestSequence(GET_INFO_FOR_ADD_PARTICIPANT);

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

const GET_PARTICIPANT_CASES :'GET_PARTICIPANT_CASES' = 'GET_PARTICIPANT_CASES';
const getParticipantCases :RequestSequence = newRequestSequence(GET_PARTICIPANT_CASES);

const GET_PERSON_PHOTO :'GET_PERSON_PHOTO' = 'GET_PERSON_PHOTO';
const getPersonPhoto :RequestSequence = newRequestSequence(GET_PERSON_PHOTO);

const GET_PROGRAM_OUTCOME :'GET_PROGRAM_OUTCOME' = 'GET_PROGRAM_OUTCOME';
const getProgramOutcome :RequestSequence = newRequestSequence(GET_PROGRAM_OUTCOME);

const MARK_DIVERSION_PLAN_AS_COMPLETE :'MARK_DIVERSION_PLAN_AS_COMPLETE' = 'MARK_DIVERSION_PLAN_AS_COMPLETE';
const markDiversionPlanAsComplete :RequestSequence = newRequestSequence(MARK_DIVERSION_PLAN_AS_COMPLETE);

const REASSIGN_JUDGE :'REASSIGN_JUDGE' = 'REASSIGN_JUDGE';
const reassignJudge :RequestSequence = newRequestSequence(REASSIGN_JUDGE);

const UPDATE_PERSON_PHOTO :'UPDATE_PERSON_PHOTO' = 'UPDATE_PERSON_PHOTO';
const updatePersonPhoto :RequestSequence = newRequestSequence(UPDATE_PERSON_PHOTO);

export {
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_PERSON_PHOTO,
  CREATE_CASE,
  CREATE_NEW_ENROLLMENT,
  EDIT_ENROLLMENT_DATES,
  EDIT_PERSON_CASE,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_REQUIRED_HOURS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_DIVERSION_PLAN,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  GET_ENROLLMENT_HISTORY,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_ADD_PARTICIPANT,
  GET_INFO_FOR_EDIT_CASE,
  GET_INFO_FOR_EDIT_PERSON,
  GET_JUDGES,
  GET_JUDGE_FOR_CASE,
  GET_PARTICIPANT,
  GET_PARTICIPANT_CASES,
  GET_PERSON_PHOTO,
  GET_PROGRAM_OUTCOME,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  REASSIGN_JUDGE,
  UPDATE_PERSON_PHOTO,
  addNewDiversionPlanStatus,
  addPersonPhoto,
  createCase,
  createNewEnrollment,
  editEnrollmentDates,
  editPersonCase,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editRequiredHours,
  getAllParticipantInfo,
  getCaseInfo,
  getDiversionPlan,
  getEnrollmentFromDiversionPlan,
  getEnrollmentHistory,
  getEnrollmentStatus,
  getInfoForAddParticipant,
  getInfoForEditCase,
  getInfoForEditPerson,
  getJudgeForCase,
  getJudges,
  getParticipant,
  getParticipantCases,
  getPersonPhoto,
  getProgramOutcome,
  markDiversionPlanAsComplete,
  reassignJudge,
  updatePersonPhoto,
};
