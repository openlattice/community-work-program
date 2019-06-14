// @flow
import { newRequestSequence } from 'redux-reqseq';

const GET_PARTICIPANT :'GET_PARTICIPANT' = 'GET_PARTICIPANT';
const getParticipant = newRequestSequence(GET_PARTICIPANT);

export {
  GET_PARTICIPANT,
  getParticipant,
};
