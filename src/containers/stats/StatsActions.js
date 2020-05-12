// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_HOURS_WORKED_BY_WORKSITE :'GET_HOURS_WORKED_BY_WORKSITE' = 'GET_HOURS_WORKED_BY_WORKSITE';
const getHoursWorkedByWorksite :RequestSequence = newRequestSequence(GET_HOURS_WORKED_BY_WORKSITE);

const GET_MONTHLY_COURT_TYPE_DATA :'GET_MONTHLY_COURT_TYPE_DATA' = 'GET_MONTHLY_COURT_TYPE_DATA';
const getMonthlyCourtTypeData :RequestSequence = newRequestSequence(GET_MONTHLY_COURT_TYPE_DATA);

const GET_STATS_DATA :'GET_STATS_DATA' = 'GET_STATS_DATA';
const getStatsData :RequestSequence = newRequestSequence(GET_STATS_DATA);

export {
  GET_HOURS_WORKED_BY_WORKSITE,
  GET_MONTHLY_COURT_TYPE_DATA,
  GET_STATS_DATA,
  getHoursWorkedByWorksite,
  getMonthlyCourtTypeData,
  getStatsData,
};
