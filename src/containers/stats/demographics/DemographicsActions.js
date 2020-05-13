// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PARTICIPANTS_DEMOGRAPHICS :'GET_PARTICIPANTS_DEMOGRAPHICS' = 'GET_PARTICIPANTS_DEMOGRAPHICS';
const getParticipantsDemographics :RequestSequence = newRequestSequence(GET_PARTICIPANTS_DEMOGRAPHICS);

export {
  GET_PARTICIPANTS_DEMOGRAPHICS,
  getParticipantsDemographics,
};
