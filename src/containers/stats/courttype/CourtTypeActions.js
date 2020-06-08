// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_COURT_TYPE_DATA :'DOWNLOAD_COURT_TYPE_DATA' = 'DOWNLOAD_COURT_TYPE_DATA';
const downloadCourtTypeData :RequestSequence = newRequestSequence(DOWNLOAD_COURT_TYPE_DATA);

const GET_ENROLLMENTS_BY_COURT_TYPE :'GET_ENROLLMENTS_BY_COURT_TYPE' = 'GET_ENROLLMENTS_BY_COURT_TYPE';
const getEnrollmentsByCourtType :RequestSequence = newRequestSequence(GET_ENROLLMENTS_BY_COURT_TYPE);

const GET_MONTHLY_COURT_TYPE_DATA :'GET_MONTHLY_COURT_TYPE_DATA' = 'GET_MONTHLY_COURT_TYPE_DATA';
const getMonthlyCourtTypeData :RequestSequence = newRequestSequence(GET_MONTHLY_COURT_TYPE_DATA);

const GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE
  :'GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE' = 'GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE';
const getMonthlyParticipantsByCourtType :RequestSequence = newRequestSequence(GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE);

const GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE
  :'GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE' = 'GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE';
const getTotalParticipantsByCourtType :RequestSequence = newRequestSequence(GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE);


export {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_MONTHLY_COURT_TYPE_DATA,
  GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE,
  GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getMonthlyCourtTypeData,
  getMonthlyParticipantsByCourtType,
  getTotalParticipantsByCourtType,
};
