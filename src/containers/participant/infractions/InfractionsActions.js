// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_INFRACTION :'ADD_INFRACTION' = 'ADD_INFRACTION';
const addInfraction :RequestSequence = newRequestSequence(ADD_INFRACTION);

const DELETE_INFRACTION_EVENT :'DELETE_INFRACTION_EVENT' = 'DELETE_INFRACTION_EVENT';
const deleteInfractionEvent = newRequestSequence(DELETE_INFRACTION_EVENT);

const EDIT_INFRACTION_EVENT:'EDIT_INFRACTION_EVENT' = 'EDIT_INFRACTION_EVENT';
const editInfractionEvent = newRequestSequence(EDIT_INFRACTION_EVENT);

const GET_INFRACTION :'GET_INFRACTION' = 'GET_INFRACTION';
const getInfraction :RequestSequence = newRequestSequence(GET_INFRACTION);

const GET_INFRACTION_TYPES :'GET_INFRACTION_TYPES' = 'GET_INFRACTION_TYPES';
const getInfractionTypes :RequestSequence = newRequestSequence(GET_INFRACTION_TYPES);

const GET_PARTICIPANT_INFRACTIONS :'GET_PARTICIPANT_INFRACTIONS' = 'GET_PARTICIPANT_INFRACTIONS';
const getParticipantInfractions :RequestSequence = newRequestSequence(GET_PARTICIPANT_INFRACTIONS);

export {
  ADD_INFRACTION,
  DELETE_INFRACTION_EVENT,
  EDIT_INFRACTION_EVENT,
  GET_INFRACTION,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT_INFRACTIONS,
  addInfraction,
  deleteInfractionEvent,
  editInfractionEvent,
  getInfraction,
  getInfractionTypes,
  getParticipantInfractions,
};
