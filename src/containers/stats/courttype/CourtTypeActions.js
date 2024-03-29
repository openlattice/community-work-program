// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_COURT_TYPE_DATA :'DOWNLOAD_COURT_TYPE_DATA' = 'DOWNLOAD_COURT_TYPE_DATA';
const downloadCourtTypeData :RequestSequence = newRequestSequence(DOWNLOAD_COURT_TYPE_DATA);

const GET_ENROLLMENTS_BY_COURT_TYPE :'GET_ENROLLMENTS_BY_COURT_TYPE' = 'GET_ENROLLMENTS_BY_COURT_TYPE';
const getEnrollmentsByCourtType :RequestSequence = newRequestSequence(GET_ENROLLMENTS_BY_COURT_TYPE);

const GET_HOURS_BY_COURT_TYPE :'GET_HOURS_BY_COURT_TYPE' = 'GET_HOURS_BY_COURT_TYPE';
const getHoursByCourtType :RequestSequence = newRequestSequence(GET_HOURS_BY_COURT_TYPE);

const GET_STATS_BY_COURT_TYPE :'GET_STATS_BY_COURT_TYPE' = 'GET_STATS_BY_COURT_TYPE';
const getStatsByCourtType :RequestSequence = newRequestSequence(GET_STATS_BY_COURT_TYPE);

const GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE
  :'GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE' = 'GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE';
const getMonthlyParticipantsByCourtType :RequestSequence = newRequestSequence(GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE);

const GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS
  :'GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS' = 'GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS';
const getMonthlyParticipantsWithNoCheckIns :RequestSequence = newRequestSequence(
  GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS
);

const GET_REFERRALS_BY_COURT_TYPE :'GET_REFERRALS_BY_COURT_TYPE' = 'GET_REFERRALS_BY_COURT_TYPE';
const getReferralsByCourtType :RequestSequence = newRequestSequence(GET_REFERRALS_BY_COURT_TYPE);

const GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE
  :'GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE' = 'GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE';
const getRepeatParticipantsByCourtType :RequestSequence = newRequestSequence(GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE);

const GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE
  :'GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE' = 'GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE';
const getTotalParticipantsByCourtType :RequestSequence = newRequestSequence(GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE);

export {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_HOURS_BY_COURT_TYPE,
  GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE,
  GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS,
  GET_REFERRALS_BY_COURT_TYPE,
  GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE,
  GET_STATS_BY_COURT_TYPE,
  GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getHoursByCourtType,
  getMonthlyParticipantsByCourtType,
  getMonthlyParticipantsWithNoCheckIns,
  getReferralsByCourtType,
  getRepeatParticipantsByCourtType,
  getStatsByCourtType,
  getTotalParticipantsByCourtType,
};
