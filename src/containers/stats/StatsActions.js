// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ENROLLMENTS_BY_COURT_TYPE :'GET_ENROLLMENTS_BY_COURT_TYPE' = 'GET_ENROLLMENTS_BY_COURT_TYPE';
const getEnrollmentsByCourtType :RequestSequence = newRequestSequence(GET_ENROLLMENTS_BY_COURT_TYPE);

const GET_MONTHLY_COURT_TYPE_DATA :'GET_MONTHLY_COURT_TYPE_DATA' = 'GET_MONTHLY_COURT_TYPE_DATA';
const getMonthlyCourtTypeData :RequestSequence = newRequestSequence(GET_MONTHLY_COURT_TYPE_DATA);

const GET_STATS_DATA :'GET_STATS_DATA' = 'GET_STATS_DATA';
const getStatsData :RequestSequence = newRequestSequence(GET_STATS_DATA);

export {
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_MONTHLY_COURT_TYPE_DATA,
  GET_STATS_DATA,
  getEnrollmentsByCourtType,
  getMonthlyCourtTypeData,
  getStatsData,
};
