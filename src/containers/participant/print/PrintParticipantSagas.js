// @flow
import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';

import {
  GET_INFO_FOR_PRINT_INFRACTION,
  getInfoForPrintInfraction,
} from './PrintParticipantActions';
import { getParticipant, getParticipantCases } from '../ParticipantActions';
import { getParticipantWorker, getParticipantCasesWorker } from '../ParticipantSagas';
import { getInfraction } from '../infractions/InfractionsActions';
import { getInfractionWorker } from '../infractions/InfractionsSagas';

const LOG = new Logger('PrintParticipantSagas');
/*
 *
 * InfractionsActions.getInfoForPrintInfraction()
 *
 */

function* getInfoForPrintInfractionWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getInfoForPrintInfraction.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(getInfoForPrintInfraction.request(id));
    const { infractionEventEKID, personEKID } = value;

    const workerResponses = yield all([
      call(getParticipantCasesWorker, getParticipantCases({ personEKID })),
      call(getInfractionWorker, getInfraction({ infractionEventEKID })),
      call(getParticipantWorker, getParticipant({ personEKID })),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) {
      throw responseError;
    }
    yield put(getInfoForPrintInfraction.success(id));
  }
  catch (error) {
    LOG.error('caught exception in getInfoForPrintInfractionWorker()', error);
    yield put(getInfoForPrintInfraction.failure(id, error));
  }
  finally {
    yield put(getInfoForPrintInfraction.finally(id));
  }
}

function* getInfoForPrintInfractionWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFO_FOR_PRINT_INFRACTION, getInfoForPrintInfractionWorker);
}

export {
  getInfoForPrintInfractionWatcher,
  getInfoForPrintInfractionWorker,
};
