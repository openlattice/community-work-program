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
import { DateTime } from 'luxon';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';

import { isDefined } from '../../../utils/LangUtils';
import {
  getAssociationNeighborESID,
  getEntityKeyId,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { deleteEntities, submitDataGraph } from '../../../core/sagas/data/DataActions';
import { deleteEntitiesWorker, submitDataGraphWorker } from '../../../core/sagas/data/DataSagas';
import {
  ADD_COURT_CHARGES_TO_CASE,
  ADD_TO_AVAILABLE_COURT_CHARGES,
  GET_COURT_CHARGES_FOR_CASE,
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  REMOVE_COURT_CHARGE_FROM_CASE,
  addCourtChargesToCase,
  addToAvailableCourtCharges,
  getArrestCharges,
  getCourtCharges,
  getCourtChargesForCase,
  removeCourtChargeFromCase,
} from './ChargesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { ASSOCIATION_DETAILS } from '../../../core/edm/constants/DataModelConsts';

const { processAssociationEntityData } = DataProcessingUtils;
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPEARS_IN,
  ARREST_CHARGE_LIST,
  CHARGE_EVENT,
  COURT_CHARGE_LIST,
  MANUAL_CHARGED_WITH,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  REGISTERED_FOR,
} = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const getPersonFromState = (state) => state.get(STATE.PERSON, Map());
const LOG = new Logger('ChargesSagas');

/*
 *
 * ChargesActions.addCourtChargesToCase()
 *
 */

function* addCourtChargesToCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse = {};
  let response :Object = {};
  let newChargeMaps :List = List();
  let chargeEKIDs :List = List();

  try {
    yield put(addCourtChargesToCase.request(id, value));
    let { associationEntityData } = value;
    const { entityData } :Object = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    const appearsInESID :UUID = getEntitySetIdFromApp(app, APPEARS_IN);

    // if data is coming from addAction in form rather than first-time submission:
    if (!associationEntityData) {

      /* Construct associationEntityData */
      const associations = [];
      const courtChargeListESID :UUID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
      const olEKID :UUID = getPropertyTypeIdFromEdm(edm, ENTITY_KEY_ID);

      const person = yield select(getPersonFromState);
      const personEKID :UUID = getEntityKeyId(person.get(PERSON.PARTICIPANT));
      const caseEKID :UUID = getEntityKeyId(person.get(PERSON.PERSON_CASE));

      fromJS(entityData).get(courtChargeListESID).forEach((courtCharge :Map, index :number) => {

        const courtChargeEKID :UUID = courtCharge.getIn([olEKID, 0]);
        associations.push([APPEARS_IN, courtChargeEKID, COURT_CHARGE_LIST, caseEKID, MANUAL_PRETRIAL_COURT_CASES]);
        associations.push([REGISTERED_FOR, index, CHARGE_EVENT, courtChargeEKID, COURT_CHARGE_LIST]);
        associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, courtChargeEKID, COURT_CHARGE_LIST]);
        associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, index, CHARGE_EVENT]);
      });

      const entitySetIds :{} = {
        [APPEARS_IN]: appearsInESID,
        [CHARGE_EVENT]: chargeEventESID,
        [COURT_CHARGE_LIST]: courtChargeListESID,
        [MANUAL_CHARGED_WITH]: getEntitySetIdFromApp(app, MANUAL_CHARGED_WITH),
        [MANUAL_PRETRIAL_COURT_CASES]: getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES),
        [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
        [REGISTERED_FOR]: getEntitySetIdFromApp(app, REGISTERED_FOR),
      };
      associationEntityData = processAssociationEntityData(associations, entitySetIds, {});

      /* Edit entityData to use datetimes instead of dates */
      delete entityData[courtChargeListESID];

      entityData[chargeEventESID] = entityData[chargeEventESID].map((charge :{}) => {
        const datetimeCompletedPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED);
        const date :string = charge[datetimeCompletedPTID][0];
        const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
        const datetime = getCombinedDateTime(date, currentTime);
        return {
          [datetimeCompletedPTID]: [datetime]
        };
      });

    }

    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) {
      throw response.error;
    }

    fromJS(entityData[chargeEventESID]).forEach((storedChargeEvent :Map, index :number) => {
      let chargeMap :Map = Map();
      let chargeEvent :Map = Map();
      storedChargeEvent.forEach((chargeEventValue, ptid) => {
        const propertyTypeFqn :FullyQualifiedName = getPropertyFqnFromEdm(edm, ptid);
        chargeEvent = chargeEvent.set(propertyTypeFqn, chargeEventValue);
      });
      chargeMap = chargeMap.set(CHARGE_EVENT, chargeEvent);
      const chargeEKID :UUID = associationEntityData[appearsInESID][index].srcEntityKeyId;
      chargeEKIDs = chargeEKIDs.push(chargeEKID);
      newChargeMaps = newChargeMaps.push(chargeMap);
    });

    yield put(addCourtChargesToCase.success(id, { chargeEKIDs, newChargeMaps }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addCourtChargesToCaseWorker()', error);
    yield put(addCourtChargesToCase.failure(id, error));
  }
  finally {
    yield put(addCourtChargesToCase.finally(id));
  }
}

function* addCourtChargesToCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_COURT_CHARGES_TO_CASE, addCourtChargesToCaseWorker);
}

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

/*
 *
 * ChargesActions.getCourtChargesForCase()
 *
 */


function* getCourtChargesForCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  /*
    person -> charged with -> charge (datetime stored on charged with)
    charge -> appears in -> case
  */
  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let chargesInCase :List = List();

  try {
    yield put(getCourtChargesForCase.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { caseEKID } = value;
    const app = yield select(getAppFromState);
    const courtCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const courtChargeListESID :UUID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);

    let searchFilter :Object = {
      entityKeyIds: [caseEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [courtChargeListESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: courtCasesESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[caseEKID]) {
      const chargesNeighborsResults :List = fromJS(response.data[caseEKID]);
      const chargesEKIDs = [];
      chargesNeighborsResults.forEach((neighbor :Map) => {
        const chargeEntity :Map = getNeighborDetails(neighbor);
        const chargeEKID :UUID = getEntityKeyId(chargeEntity);
        chargesEKIDs.push(chargeEKID);
        chargesInCase = chargesInCase.push(fromJS({
          [COURT_CHARGE_LIST]: chargeEntity
        }));
      });

      const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
      searchFilter = {
        entityKeyIds: chargesEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [chargeEventESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: courtChargeListESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const chargeEventResults :Map = fromJS(response.data);
      if (!chargeEventResults.isEmpty()) {
        chargeEventResults.forEach((chargeEventObj :List, chargeEKID :UUID) => {
          const chargeEvent :Map = getNeighborDetails(chargeEventObj.get(0));
          let chargeMap :Map = chargesInCase.find((map :Map) => getEntityKeyId(
            map.get(COURT_CHARGE_LIST)
          ) === chargeEKID);
          if (isDefined(chargeMap)) {
            const chargeMapIndex :number = chargesInCase.findIndex((map :Map) => getEntityKeyId(
              map.get(COURT_CHARGE_LIST)
            ) === chargeEKID);
            chargeMap = chargeMap.set(CHARGE_EVENT, chargeEvent);
            chargesInCase = chargesInCase.set(chargeMapIndex, chargeMap);
          }
        });
      }
    }

    yield put(getCourtChargesForCase.success(id, chargesInCase));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getCourtChargesForCaseWorker()', error);
    yield put(getCourtChargesForCase.failure(id, error));
  }
  finally {
    yield put(getCourtChargesForCase.finally(id));
  }
  return workerResponse;
}

function* getCourtChargesForCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_COURT_CHARGES_FOR_CASE, getCourtChargesForCaseWorker);
}

/*
 *
 * ChargesActions.removeCourtChargeFromCase()
 *
 */

function* removeCourtChargeFromCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :{} = {};

  try {
    yield put(removeCourtChargeFromCase.request(id, value));

    const { entityData } = value;

    const app = yield select(getAppFromState);
    const courtChargeListESID :UUID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    const caseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    const courtChargeListIterator = entityData[courtChargeListESID].values();
    const courtChargeListEKID :UUID = courtChargeListIterator.next().value;
    const chargeEventIterator = entityData[chargeEventESID].values();
    const chargeEventEKID :UUID = chargeEventIterator.next().value;

    const entitiesToDelete :Object[] = [{
      entitySetId: chargeEventESID,
      entityKeyId: chargeEventEKID
    }];

    const searchFilter = {
      entityKeyIds: [courtChargeListEKID],
      destinationEntitySetIds: [caseESID],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: courtChargeListESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[courtChargeListEKID]) {
      fromJS(response.data[courtChargeListEKID]).forEach((neighbor :Map) => {
        const associationEntity :Map = neighbor.get(ASSOCIATION_DETAILS);
        const associationEKID :UUID = getEntityKeyId(associationEntity);
        const associationESID :UUID = getAssociationNeighborESID(neighbor);
        entitiesToDelete.push({
          entitySetId: associationESID,
          entityKeyId: associationEKID
        });
      });
    }

    response = yield call(deleteEntitiesWorker, deleteEntities(entitiesToDelete));
    if (response.error) {
      throw response.error;
    }

    yield put(removeCourtChargeFromCase.success(id, {}));
  }
  catch (error) {
    LOG.error('caught exception in removeCourtChargeFromCaseWorker()', error);
    yield put(removeCourtChargeFromCase.failure(id, error));
  }
  finally {
    yield put(removeCourtChargeFromCase.finally(id));
  }
}

function* removeCourtChargeFromCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(REMOVE_COURT_CHARGE_FROM_CASE, removeCourtChargeFromCaseWorker);
}

export {
  addCourtChargesToCaseWatcher,
  addCourtChargesToCaseWorker,
  addToAvailableCourtChargesWatcher,
  addToAvailableCourtChargesWorker,
  getArrestChargesWatcher,
  getArrestChargesWorker,
  getCourtChargesForCaseWatcher,
  getCourtChargesForCaseWorker,
  getCourtChargesWatcher,
  getCourtChargesWorker,
  removeCourtChargeFromCaseWatcher,
  removeCourtChargeFromCaseWorker,
};
