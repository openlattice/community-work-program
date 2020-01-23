// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ARREST_CHARGES :'GET_ARREST_CHARGES' = 'GET_ARREST_CHARGES';
const getArrestCharges :RequestSequence = newRequestSequence(GET_ARREST_CHARGES);

const GET_COURT_CHARGES :'GET_COURT_CHARGES' = 'GET_COURT_CHARGES';
const getCourtCharges :RequestSequence = newRequestSequence(GET_COURT_CHARGES);

export {
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  getArrestCharges,
  getCourtCharges,
};
