/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_PARTICIPANTS :'GET_PARTICIPANTS' = 'GET_PARTICIPANTS';
const getParticipants :RequestSequence = newRequestSequence(GET_PARTICIPANTS);

export {
  GET_PARTICIPANTS,
  getParticipants,
};
