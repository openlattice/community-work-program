// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_INFRACTION :'ADD_INFRACTION' = 'ADD_INFRACTION';
const addInfraction :RequestSequence = newRequestSequence(ADD_INFRACTION);

const GET_INFRACTION_TYPES :'GET_INFRACTION_TYPES' = 'GET_INFRACTION_TYPES';
const getInfractionTypes :RequestSequence = newRequestSequence(GET_INFRACTION_TYPES);

const GET_PARTICIPANT_INFRACTIONS :'GET_PARTICIPANT_INFRACTIONS' = 'GET_PARTICIPANT_INFRACTIONS';
const getParticipantInfractions :RequestSequence = newRequestSequence(GET_PARTICIPANT_INFRACTIONS);

export {
  ADD_INFRACTION,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT_INFRACTIONS,
  addInfraction,
  getInfractionTypes,
  getParticipantInfractions,
};
