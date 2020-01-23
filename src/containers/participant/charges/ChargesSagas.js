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
import { Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';

import { getEntitySetIdFromApp, getPropertyFqnFromEdm } from '../../../utils/DataUtils';
import { submitDataGraph } from '../../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../../core/sagas/data/DataSagas';
import {
  ADD_TO_AVAILABLE_COURT_CHARGES,
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  addToAvailableCourtCharges,
  getArrestCharges,
  getCourtCharges,
} from './ChargesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST } = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const LOG = new Logger('ChargesSagas');

/*
 *
 * ChargesActions.addToAvailableCourtCharges()
 *
 */

function* addToAvailableCourtChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(addToAvailableCourtCharges.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const courtChargeListESID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
    const courtChargeEKID = entityKeyIds[courtChargeListESID][0];

    const { entityData } = value;
    const newChargeData = fromJS(entityData[courtChargeListESID][0]);

    let newCharge :Map = Map();
    newCharge = newCharge.set(ENTITY_KEY_ID, courtChargeEKID);
    newChargeData.forEach((chargeValue, ptid) => {
      const propertyTypeFqn :FullyQualifiedName = getPropertyFqnFromEdm(edm, ptid);
      newCharge = newCharge.set(propertyTypeFqn, chargeValue);
    });

    yield put(addToAvailableCourtCharges.success(id, { newCharge }));
  }
  catch (error) {
    LOG.error('caught exception in addToAvailableCourtChargesWorker()', error);
    yield put(addToAvailableCourtCharges.failure(id, error));
  }
  finally {
    yield put(addToAvailableCourtCharges.finally(id));
  }
}

function* addToAvailableCourtChargesWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_TO_AVAILABLE_COURT_CHARGES, addToAvailableCourtChargesWorker);
}

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
  addToAvailableCourtChargesWatcher,
  addToAvailableCourtChargesWorker,
  getArrestChargesWatcher,
  getArrestChargesWorker,
  getCourtChargesWatcher,
  getCourtChargesWorker,
};
