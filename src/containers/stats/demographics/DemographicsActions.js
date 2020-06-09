// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_DEMOGRAPHICS_DATA :'DOWNLOAD_DEMOGRAPHICS_DATA' = 'DOWNLOAD_DEMOGRAPHICS_DATA';
const downloadDemographicsData :RequestSequence = newRequestSequence(DOWNLOAD_DEMOGRAPHICS_DATA);

const GET_MONTHLY_DEMOGRAPHICS :'GET_MONTHLY_DEMOGRAPHICS' = 'GET_MONTHLY_DEMOGRAPHICS';
const getMonthlyDemographics :RequestSequence = newRequestSequence(GET_MONTHLY_DEMOGRAPHICS);

const GET_PARTICIPANTS_DEMOGRAPHICS :'GET_PARTICIPANTS_DEMOGRAPHICS' = 'GET_PARTICIPANTS_DEMOGRAPHICS';
const getParticipantsDemographics :RequestSequence = newRequestSequence(GET_PARTICIPANTS_DEMOGRAPHICS);

export {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_MONTHLY_DEMOGRAPHICS,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getMonthlyDemographics,
  getParticipantsDemographics,
};
