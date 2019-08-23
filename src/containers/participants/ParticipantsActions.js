/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_PARTICIPANT :'ADD_PARTICIPANT' = 'ADD_PARTICIPANT';
const addParticipant :RequestSequence = newRequestSequence(ADD_PARTICIPANT);

const GET_ENROLLMENT_STATUSES :'GET_ENROLLMENT_STATUSES' = 'GET_ENROLLMENT_STATUSES';
const getEnrollmentStatuses :RequestSequence = newRequestSequence(GET_ENROLLMENT_STATUSES);

const GET_HOURS_WORKED :'GET_HOURS_WORKED' = 'GET_HOURS_WORKED';
const getHoursWorked :RequestSequence = newRequestSequence(GET_HOURS_WORKED);

const GET_INFRACTIONS :'GET_INFRACTIONS' = 'GET_INFRACTIONS';
const getInfractions :RequestSequence = newRequestSequence(GET_INFRACTIONS);

const GET_PARTICIPANTS :'GET_PARTICIPANTS' = 'GET_PARTICIPANTS';
const getParticipants :RequestSequence = newRequestSequence(GET_PARTICIPANTS);

const GET_SENTENCES :'GET_SENTENCES' = 'GET_SENTENCES';
const getSentences :RequestSequence = newRequestSequence(GET_SENTENCES);

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
function resetRequestState(actionType :string) {
  return {
    actionType,
    type: RESET_REQUEST_STATE,
  };
}

export {
  ADD_PARTICIPANT,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  GET_SENTENCES,
  RESET_REQUEST_STATE,
  addParticipant,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipants,
  getSentences,
  resetRequestState,
};
