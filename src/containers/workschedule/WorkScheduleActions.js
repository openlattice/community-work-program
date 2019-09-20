/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const FIND_APPOINTMENTS :'FIND_APPOINTMENTS' = 'FIND_APPOINTMENTS';
const findAppointments :RequestSequence = newRequestSequence(FIND_APPOINTMENTS);

export {
  FIND_APPOINTMENTS,
  findAppointments,
};
