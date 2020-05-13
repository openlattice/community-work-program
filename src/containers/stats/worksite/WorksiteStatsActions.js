// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_CHECK_IN_NEIGHBORS :'GET_CHECK_IN_NEIGHBORS' = 'GET_CHECK_IN_NEIGHBORS';
const getCheckInNeighbors :RequestSequence = newRequestSequence(GET_CHECK_IN_NEIGHBORS);

const GET_HOURS_WORKED_BY_WORKSITE :'GET_HOURS_WORKED_BY_WORKSITE' = 'GET_HOURS_WORKED_BY_WORKSITE';
const getHoursWorkedByWorksite :RequestSequence = newRequestSequence(GET_HOURS_WORKED_BY_WORKSITE);

const GET_MONTHLY_PARTICIPANTS_BY_WORKSITE
  :'GET_MONTHLY_PARTICIPANTS_BY_WORKSITE' = 'GET_MONTHLY_PARTICIPANTS_BY_WORKSITE';
const getMonthlyParticipantsByWorksite :RequestSequence = newRequestSequence(GET_MONTHLY_PARTICIPANTS_BY_WORKSITE);

const GET_WORKSITES :'GET_WORKSITES' = 'GET_WORKSITES';
const getWorksites :RequestSequence = newRequestSequence(GET_WORKSITES);

const GET_WORKSITE_STATS_DATA :'GET_WORKSITE_STATS_DATA' = 'GET_WORKSITE_STATS_DATA';
const getWorksiteStatsData :RequestSequence = newRequestSequence(GET_WORKSITE_STATS_DATA);

export {
  GET_CHECK_IN_NEIGHBORS,
  GET_HOURS_WORKED_BY_WORKSITE,
  GET_MONTHLY_PARTICIPANTS_BY_WORKSITE,
  GET_WORKSITES,
  GET_WORKSITE_STATS_DATA,
  getCheckInNeighbors,
  getHoursWorkedByWorksite,
  getMonthlyParticipantsByWorksite,
  getWorksiteStatsData,
  getWorksites,
};
