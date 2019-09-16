/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_PARTICIPANT :'ADD_PARTICIPANT' = 'ADD_PARTICIPANT';
const addParticipant :RequestSequence = newRequestSequence(ADD_PARTICIPANT);

const GET_DIVERSION_PLANS :'GET_DIVERSION_PLANS' = 'GET_DIVERSION_PLANS';
const getDiversionPlans :RequestSequence = newRequestSequence(GET_DIVERSION_PLANS);

const GET_ENROLLMENT_STATUSES :'GET_ENROLLMENT_STATUSES' = 'GET_ENROLLMENT_STATUSES';
const getEnrollmentStatuses :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUSES);

const GET_HOURS_WORKED :'GET_HOURS_WORKED' = 'GET_HOURS_WORKED';
const getHoursWorked :RequestSequence = newRequestSequence(GET_HOURS_WORKED);

const GET_INFRACTIONS :'GET_INFRACTIONS' = 'GET_INFRACTIONS';
const getInfractions :RequestSequence = newRequestSequence(GET_INFRACTIONS);

const GET_PARTICIPANTS :'GET_PARTICIPANTS' = 'GET_PARTICIPANTS';
const getParticipants :RequestSequence = newRequestSequence(GET_PARTICIPANTS);

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
function resetRequestState(actionType :string) {
  return {
    actionType,
    type: RESET_REQUEST_STATE,
  };
}

export {
  ADD_PARTICIPANT,
  GET_DIVERSION_PLANS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  RESET_REQUEST_STATE,
  addParticipant,
  getDiversionPlans,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipants,
  resetRequestState,
};
