// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ARREST_CHARGE_STATS :'GET_ARREST_CHARGE_STATS' = 'GET_ARREST_CHARGE_STATS';
const getArrestChargeStats :RequestSequence = newRequestSequence(GET_ARREST_CHARGE_STATS);

export {
  GET_ARREST_CHARGE_STATS,
  getArrestChargeStats,
};
