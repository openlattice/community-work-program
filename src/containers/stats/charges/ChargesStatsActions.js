// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ARREST_CHARGE_STATS :'GET_ARREST_CHARGE_STATS' = 'GET_ARREST_CHARGE_STATS';
const getArrestChargeStats :RequestSequence = newRequestSequence(GET_ARREST_CHARGE_STATS);

const GET_CHARGES_STATS :'GET_CHARGES_STATS' = 'GET_CHARGES_STATS';
const getChargesStats :RequestSequence = newRequestSequence(GET_CHARGES_STATS);

const GET_COURT_CHARGE_STATS :'GET_COURT_CHARGE_STATS' = 'GET_COURT_CHARGE_STATS';
const getCourtChargeStats :RequestSequence = newRequestSequence(GET_COURT_CHARGE_STATS);

export {
  GET_ARREST_CHARGE_STATS,
  GET_CHARGES_STATS,
  GET_COURT_CHARGE_STATS,
  getArrestChargeStats,
  getChargesStats,
  getCourtChargeStats,
};
