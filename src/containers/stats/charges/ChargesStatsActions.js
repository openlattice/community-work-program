// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_CHARGES_STATS :'DOWNLOAD_CHARGES_STATS' = 'DOWNLOAD_CHARGES_STATS';
const downloadChargesStats :RequestSequence = newRequestSequence(DOWNLOAD_CHARGES_STATS);

const GET_CHARGES_STATS :'GET_CHARGES_STATS' = 'GET_CHARGES_STATS';
const getChargesStats :RequestSequence = newRequestSequence(GET_CHARGES_STATS);

const GET_INDIVIDUAL_CHARGE_TYPE_STATS :'GET_INDIVIDUAL_CHARGE_TYPE_STATS' = 'GET_INDIVIDUAL_CHARGE_TYPE_STATS';
const getIndividualChargeTypeStats :RequestSequence = newRequestSequence(GET_INDIVIDUAL_CHARGE_TYPE_STATS);


export {
  DOWNLOAD_CHARGES_STATS,
  GET_CHARGES_STATS,
  GET_INDIVIDUAL_CHARGE_TYPE_STATS,
  downloadChargesStats,
  getChargesStats,
  getIndividualChargeTypeStats,
};
