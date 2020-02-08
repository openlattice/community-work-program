/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const FIND_APPOINTMENTS :'FIND_APPOINTMENTS' = 'FIND_APPOINTMENTS';
const findAppointments :RequestSequence = newRequestSequence(FIND_APPOINTMENTS);

const GET_PERSON_COURT_TYPE :'GET_PERSON_COURT_TYPE' = 'GET_PERSON_COURT_TYPE';
const getPersonCourtType :RequestSequence = newRequestSequence(GET_PERSON_COURT_TYPE);

const GET_WORKSITE_AND_PERSON_NAMES
  :'GET_WORKSITE_AND_PERSON_NAMES' = 'GET_WORKSITE_AND_PERSON_NAMES';
const getWorksiteAndPersonNames :RequestSequence = newRequestSequence(GET_WORKSITE_AND_PERSON_NAMES);

export {
  FIND_APPOINTMENTS,
  GET_PERSON_COURT_TYPE,
  GET_WORKSITE_AND_PERSON_NAMES,
  findAppointments,
  getPersonCourtType,
  getWorksiteAndPersonNames,
};
