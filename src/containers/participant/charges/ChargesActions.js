// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_COURT_CHARGES_TO_CASE :'ADD_COURT_CHARGES_TO_CASE' = 'ADD_COURT_CHARGES_TO_CASE';
const addCourtChargesToCase :RequestSequence = newRequestSequence(ADD_COURT_CHARGES_TO_CASE);

const ADD_TO_AVAILABLE_COURT_CHARGES :'ADD_TO_AVAILABLE_COURT_CHARGES' = 'ADD_TO_AVAILABLE_COURT_CHARGES';
const addToAvailableCourtCharges :RequestSequence = newRequestSequence(ADD_TO_AVAILABLE_COURT_CHARGES);

const GET_ARREST_CHARGES :'GET_ARREST_CHARGES' = 'GET_ARREST_CHARGES';
const getArrestCharges :RequestSequence = newRequestSequence(GET_ARREST_CHARGES);

const GET_COURT_CHARGES :'GET_COURT_CHARGES' = 'GET_COURT_CHARGES';
const getCourtCharges :RequestSequence = newRequestSequence(GET_COURT_CHARGES);

const GET_COURT_CHARGES_FOR_CASE :'GET_COURT_CHARGES_FOR_CASE' = 'GET_COURT_CHARGES_FOR_CASE';
const getCourtChargesForCase :RequestSequence = newRequestSequence(GET_COURT_CHARGES_FOR_CASE);

export {
  ADD_COURT_CHARGES_TO_CASE,
  ADD_TO_AVAILABLE_COURT_CHARGES,
  GET_COURT_CHARGES_FOR_CASE,
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  addCourtChargesToCase,
  addToAvailableCourtCharges,
  getArrestCharges,
  getCourtCharges,
  getCourtChargesForCase,
};
