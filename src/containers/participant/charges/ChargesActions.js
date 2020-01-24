// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_COURT_CHARGES_TO_CASE :'ADD_COURT_CHARGES_TO_CASE' = 'ADD_COURT_CHARGES_TO_CASE';
const addCourtChargesToCase :RequestSequence = newRequestSequence(ADD_COURT_CHARGES_TO_CASE);

const ADD_TO_AVAILABLE_ARREST_CHARGES :'ADD_TO_AVAILABLE_ARREST_CHARGES' = 'ADD_TO_AVAILABLE_ARREST_CHARGES';
const addToAvailableArrestCharges :RequestSequence = newRequestSequence(ADD_TO_AVAILABLE_ARREST_CHARGES);

const ADD_TO_AVAILABLE_COURT_CHARGES :'ADD_TO_AVAILABLE_COURT_CHARGES' = 'ADD_TO_AVAILABLE_COURT_CHARGES';
const addToAvailableCourtCharges :RequestSequence = newRequestSequence(ADD_TO_AVAILABLE_COURT_CHARGES);

const GET_ARREST_CHARGES :'GET_ARREST_CHARGES' = 'GET_ARREST_CHARGES';
const getArrestCharges :RequestSequence = newRequestSequence(GET_ARREST_CHARGES);

const GET_ARREST_CASES_AND_CHARGES_FROM_PSA
  :'GET_ARREST_CASES_AND_CHARGES_FROM_PSA' = 'GET_ARREST_CASES_AND_CHARGES_FROM_PSA';
const getArrestCasesAndChargesFromPSA :RequestSequence = newRequestSequence(GET_ARREST_CASES_AND_CHARGES_FROM_PSA);

const GET_COURT_CHARGES :'GET_COURT_CHARGES' = 'GET_COURT_CHARGES';
const getCourtCharges :RequestSequence = newRequestSequence(GET_COURT_CHARGES);

const GET_COURT_CHARGES_FOR_CASE :'GET_COURT_CHARGES_FOR_CASE' = 'GET_COURT_CHARGES_FOR_CASE';
const getCourtChargesForCase :RequestSequence = newRequestSequence(GET_COURT_CHARGES_FOR_CASE);

const REMOVE_COURT_CHARGE_FROM_CASE :'REMOVE_COURT_CHARGE_FROM_CASE' = 'REMOVE_COURT_CHARGE_FROM_CASE';
const removeCourtChargeFromCase :RequestSequence = newRequestSequence(REMOVE_COURT_CHARGE_FROM_CASE);

export {
  ADD_COURT_CHARGES_TO_CASE,
  ADD_TO_AVAILABLE_ARREST_CHARGES,
  ADD_TO_AVAILABLE_COURT_CHARGES,
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  GET_COURT_CHARGES_FOR_CASE,
  GET_ARREST_CASES_AND_CHARGES_FROM_PSA,
  REMOVE_COURT_CHARGE_FROM_CASE,
  addCourtChargesToCase,
  addToAvailableArrestCharges,
  addToAvailableCourtCharges,
  getArrestCharges,
  getCourtCharges,
  getCourtChargesForCase,
  getArrestCasesAndChargesFromPSA,
  removeCourtChargeFromCase,
};
