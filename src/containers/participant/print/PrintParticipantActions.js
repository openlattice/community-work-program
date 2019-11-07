// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_INFO_FOR_PRINT_INFRACTION :'GET_INFO_FOR_PRINT_INFRACTION' = 'GET_INFO_FOR_PRINT_INFRACTION';
const getInfoForPrintInfraction :RequestSequence = newRequestSequence(GET_INFO_FOR_PRINT_INFRACTION);

export {
  GET_INFO_FOR_PRINT_INFRACTION,
  getInfoForPrintInfraction,
};
