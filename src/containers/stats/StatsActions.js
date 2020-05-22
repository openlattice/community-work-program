// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_STATS_DATA :'GET_STATS_DATA' = 'GET_STATS_DATA';
const getStatsData :RequestSequence = newRequestSequence(GET_STATS_DATA);

export {
  GET_STATS_DATA,
  getStatsData,
};
