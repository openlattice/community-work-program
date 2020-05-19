// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_DEMOGRAPHICS_DATA :'DOWNLOAD_DEMOGRAPHICS_DATA' = 'DOWNLOAD_DEMOGRAPHICS_DATA';
const downloadDemographicsData :RequestSequence = newRequestSequence(DOWNLOAD_DEMOGRAPHICS_DATA);

const GET_PARTICIPANTS_DEMOGRAPHICS :'GET_PARTICIPANTS_DEMOGRAPHICS' = 'GET_PARTICIPANTS_DEMOGRAPHICS';
const getParticipantsDemographics :RequestSequence = newRequestSequence(GET_PARTICIPANTS_DEMOGRAPHICS);

export {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getParticipantsDemographics,
};
