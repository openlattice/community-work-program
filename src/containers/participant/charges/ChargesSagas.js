// @flow
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';

import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import {
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  getArrestCharges,
  getCourtCharges,
} from './ChargesActions';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST } = APP_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const LOG = new Logger('ChargesSagas');

/*
 *
 * ChargesActions.getArrestCharges()
 *
 */

function* getArrestChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const workerResponse = {};
  let response :Object = {};
  let arrestCharges :List = List();

  try {
    yield put(getArrestCharges.request(id));
    const app = yield select(getAppFromState);
    const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: arrestChargeListESID }));
    if (response.error) {
      throw response.error;
    }
    arrestCharges = fromJS(response.data);

    yield put(getArrestCharges.success(id, arrestCharges));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getArrestChargesWorker()', error);
    yield put(getArrestCharges.failure(id, error));
  }
  finally {
    yield put(getArrestCharges.finally(id));
  }
  return workerResponse;
}

function* getArrestChargesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ARREST_CHARGES, getArrestChargesWorker);
}

/*
 *
 * ChargesActions.getCourtCharges()
 *
 */

function* getCourtChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const workerResponse = {};
  let response :Object = {};
  let charges :List = List();

  try {
    yield put(getCourtCharges.request(id));
    const app = yield select(getAppFromState);
    const courtChargeListESID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: courtChargeListESID }));
    if (response.error) {
      throw response.error;
    }
    charges = fromJS(response.data);

    yield put(getCourtCharges.success(id, charges));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getCourtChargesWorker()', error);
    yield put(getCourtCharges.failure(id, error));
  }
  finally {
    yield put(getCourtCharges.finally(id));
  }
  return workerResponse;
}

function* getCourtChargesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_COURT_CHARGES, getCourtChargesWorker);
}

export {
  getArrestChargesWatcher,
  getArrestChargesWorker,
  getCourtChargesWatcher,
  getCourtChargesWorker,
};
