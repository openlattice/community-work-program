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
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';

import { isDefined } from '../../../utils/LangUtils';
import {
  getAssociationNeighborESID,
  getEntityKeyId,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyFqnFromEdm,
} from '../../../utils/DataUtils';
import { deleteEntities, submitDataGraph } from '../../../core/sagas/data/DataActions';
import { deleteEntitiesWorker, submitDataGraphWorker } from '../../../core/sagas/data/DataSagas';
import {
  ADD_ARREST_CHARGES,
  ADD_COURT_CHARGES_TO_CASE,
  ADD_TO_AVAILABLE_ARREST_CHARGES,
  ADD_TO_AVAILABLE_COURT_CHARGES,
  GET_ARREST_CASES_AND_CHARGES_FROM_PSA,
  GET_ARREST_CHARGES,
  GET_ARREST_CHARGES_LINKED_TO_CWP,
  GET_COURT_CHARGES,
  GET_COURT_CHARGES_FOR_CASE,
  REMOVE_ARREST_CHARGE,
  REMOVE_COURT_CHARGE_FROM_CASE,
  addArrestCharges,
  addCourtChargesToCase,
  addToAvailableArrestCharges,
  addToAvailableCourtCharges,
  getArrestCasesAndChargesFromPSA,
  getArrestCharges,
  getArrestChargesLinkedToCWP,
  getCourtCharges,
  getCourtChargesForCase,
  removeArrestCharge,
  removeCourtChargeFromCase,
} from './ChargesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { CHARGES, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { ASSOCIATION_DETAILS } from '../../../core/edm/constants/DataModelConsts';

const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPEARS_IN_ARREST,
  ARREST_CHARGE_LIST,
  CHARGE_EVENT,
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  MANUAL_ARREST_CASES,
  MANUAL_ARREST_CHARGES,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  REGISTERED_FOR,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ARREST_CASE_BY_ARREST_CHARGE_EKID_FROM_PSA, ARREST_CHARGES_BY_EKID, ARREST_CHARGES_FROM_PSA } = CHARGES;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getChargesFromState = (state) => state.get(STATE.CHARGES, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const LOG = new Logger('ChargesSagas');

/*
 *
 * ChargesActions.addArrestCharges()
 *
 */

function* addArrestChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let arrestChargeMapsCreatedInCWP :List = List();
  let arrestChargeMapsCreatedInPSA :List = List();
  let psaArrestCaseByArrestCharge :Map = Map();
  let cwpArrestCaseByArrestCharge :Map = Map();

  try {
    yield put(addArrestCharges.request(id, value));
    const { associationEntityData, entityData } = value;

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) {
      throw response.error;
    }

    const { entityKeyIds } = response.data;
    const { entitySetIds } = response.data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const chargesState = yield select(getChargesFromState);
    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    const chargeEventEKIDs :UUID[] = entityKeyIds[chargeEventESID];

    chargeEventEKIDs.forEach((ekid :UUID, index :number) => {
      // construct charge event entity:
      const newChargeEvent :Map = Map().withMutations((map :Map) => {
        map.set(ENTITY_KEY_ID, List([ekid]));
        fromJS(entityData[chargeEventESID][index]).forEach((chargeEventValue, ptid) => {
          const propertyTypeFqn :FullyQualifiedName = getPropertyFqnFromEdm(edm, ptid);
          map.set(propertyTypeFqn, chargeEventValue);
        });
      }).asImmutable();
      let newChargeMap :Map = Map({ [CHARGE_EVENT]: newChargeEvent });
      // find associated charge:
      const registeredForESID :UUID = getEntitySetIdFromApp(app, REGISTERED_FOR);
      const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
      const manualArrestChargeESID :UUID = getEntitySetIdFromApp(app, MANUAL_ARREST_CHARGES);
      const appearsInArrestESID :UUID = getEntitySetIdFromApp(app, APPEARS_IN_ARREST);
      const chargeEventToChargeAssociation :Object = associationEntityData[registeredForESID][index];
      const arrestChargesByEKID :Map = chargesState.get(ARREST_CHARGES_BY_EKID, Map());
      const arrestChargesFromPSA :List = chargesState.get(ARREST_CHARGES_FROM_PSA, List());
      const arrestCaseByArrestChargeEKIDFromPSA :Map = chargesState
        .get(ARREST_CASE_BY_ARREST_CHARGE_EKID_FROM_PSA, Map());
      let charge :Map = Map();
      if (chargeEventToChargeAssociation.dstEntitySetId === arrestChargeListESID) {
        const chargeEKID :UUID = chargeEventToChargeAssociation.dstEntityKeyId;
        charge = arrestChargesByEKID.get(chargeEKID, Map());
        newChargeMap = newChargeMap.set(ARREST_CHARGE_LIST, charge);
        arrestChargeMapsCreatedInCWP = arrestChargeMapsCreatedInCWP.push(newChargeMap);

        const newCaseUUID :UUID = entitySetIds[appearsInArrestESID][index];
        cwpArrestCaseByArrestCharge = cwpArrestCaseByArrestCharge.set(chargeEKID, newCaseUUID);
      }
      if (chargeEventToChargeAssociation.dstEntitySetId === manualArrestChargeESID) {
        charge = arrestChargesFromPSA
          .find((arrestCharge :Map) => getEntityKeyId(arrestCharge) === chargeEventToChargeAssociation.dstEntityKeyId);
        newChargeMap = newChargeMap.set(MANUAL_ARREST_CHARGES, charge);
        arrestChargeMapsCreatedInPSA = arrestChargeMapsCreatedInPSA.push(newChargeMap);

        const chargeEKID :UUID = getEntityKeyId(charge);
        const caseEKID :UUID = getEntityKeyId(arrestCaseByArrestChargeEKIDFromPSA.get(chargeEKID, ''));
        psaArrestCaseByArrestCharge = psaArrestCaseByArrestCharge.set(chargeEKID, caseEKID);
      }
    });

    yield put(addArrestCharges.success(id, {
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
      cwpArrestCaseByArrestCharge,
      psaArrestCaseByArrestCharge,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addArrestCharges.failure(id, error));
  }
  finally {
    yield put(addArrestCharges.finally(id));
  }
}

function* addArrestChargesWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_ARREST_CHARGES, addArrestChargesWorker);
}

/*
 *
 * ChargesActions.addCourtChargesToCase()
 *
 */

function* addCourtChargesToCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let newChargeMaps :List = List();
  let courtChargeEKIDs :List = List();

  try {
    yield put(addCourtChargesToCase.request(id, value));
    const { associationEntityData } :Object = value;
    const { entityData } :Object = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    const registeredForESID :UUID = getEntitySetIdFromApp(app, REGISTERED_FOR);

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;
    const { entityKeyIds } = response.data;

    fromJS(entityData[chargeEventESID]).forEach((storedChargeEvent :Map, index :number) => {

      const chargeEvent :Map = Map().withMutations((map :Map) => {
        const chargeEventEKID :UUID = entityKeyIds[chargeEventESID][0];
        map.set(ENTITY_KEY_ID, List([chargeEventEKID]));
        storedChargeEvent.forEach((chargeEventValue, ptid) => {
          const propertyTypeFqn :FullyQualifiedName = getPropertyFqnFromEdm(edm, ptid);
          map.set(propertyTypeFqn, chargeEventValue);
        });
      }).asImmutable();

      const chargeMap :Map = Map().withMutations((map :Map) => {
        map.set(CHARGE_EVENT, chargeEvent);
      });
      newChargeMaps = newChargeMaps.push(chargeMap);

      const courtChargeEKID :UUID = associationEntityData[registeredForESID][index].dstEntityKeyId;
      courtChargeEKIDs = courtChargeEKIDs.push(courtChargeEKID);
    });

    yield put(addCourtChargesToCase.success(id, { courtChargeEKIDs, newChargeMaps }));
  }
  catch (error) {
    LOG.error(action.type, error);
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
 * ChargesActions.addToAvailableArrestCharges()
 *
 */

function* addToAvailableArrestChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(addToAvailableArrestCharges.request(id, value));

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const arrestChargeListESID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
    const arrestChargeEKID = entityKeyIds[arrestChargeListESID][0];

    const { entityData } = value;
    const newChargeData = fromJS(entityData[arrestChargeListESID][0]);

    let newCharge :Map = Map();
    newCharge = newCharge.set(ENTITY_KEY_ID, arrestChargeEKID);
    newChargeData.forEach((chargeValue, ptid) => {
      const propertyTypeFqn :FullyQualifiedName = getPropertyFqnFromEdm(edm, ptid);
      newCharge = newCharge.set(propertyTypeFqn, chargeValue);
    });

    yield put(addToAvailableArrestCharges.success(id, { newCharge }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addToAvailableArrestCharges.failure(id, error));
  }
  finally {
    yield put(addToAvailableArrestCharges.finally(id));
  }
}

function* addToAvailableArrestChargesWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_TO_AVAILABLE_ARREST_CHARGES, addToAvailableArrestChargesWorker);
}

/*
 *
 * ChargesActions.addToAvailableCourtCharges()
 *
 */

function* addToAvailableCourtChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(addToAvailableCourtCharges.request(id, value));

    const response :Object = yield call(submitDataGraphWorker, submitDataGraph(value));
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
  let arrestCharges :List = List();
  let arrestChargesByEKID :Map = Map();

  try {
    yield put(getArrestCharges.request(id));
    const app = yield select(getAppFromState);
    const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);

    const response :Object = yield call(
      getEntitySetDataWorker,
      getEntitySetData({ entitySetId: arrestChargeListESID })
    );
    if (response.error) {
      throw response.error;
    }
    arrestCharges = fromJS(response.data);
    if (!arrestCharges.isEmpty()) {
      arrestChargesByEKID = Map().withMutations((map :Map) => {
        arrestCharges.forEach((charge :Map) => {
          map.set(getEntityKeyId(charge), charge);
        });
      });
    }

    yield put(getArrestCharges.success(id, { arrestCharges, arrestChargesByEKID }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
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
 * ChargesActions.getArrestChargesLinkedToCWP()
 *
 */

function* getArrestChargesLinkedToCWPWorker(action :SequenceAction) :Generator<*, *, *> {

  /*
    charge event -> registered for -> arrest charge
        for charges from PSA: arrest charge is in MANUAL_ARREST_CHARGES
        for newly created charges in CWP: arrest charge is in ARREST_CHARGE_LIST
    person -> charged with -> arrest charge
        for charges from PSA: ARREST_CHARGED_WITH
        for newly created charges in CWP: MANUAL_CHARGED_WITH
    person -> charged with -> charge event
        for both: MANUAL_CHARGED_WITH
    arrest charge -> appears in -> arrest case
        for charges from PSA: APPEARS_IN_ARREST
        for newly created charges in CWP: APPEARS_IN
    person -> appears in -> arrest case
        for both: APPEARS_IN_ARREST, MANUAL_ARREST_CASES
    diversion plan -> related to -> arrest case
  */
  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let arrestChargeMapsCreatedInCWP :List = List();
  let arrestChargeMapsCreatedInPSA :List = List();
  let psaArrestCaseByArrestCharge :Map = Map();
  let cwpArrestCaseByArrestCharge :Map = Map();

  try {
    yield put(getArrestChargesLinkedToCWP.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { diversionPlanEKID } = value;
    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const arrestCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_ARREST_CASES);

    const arrestCaseSearchFilter :Object = {
      entityKeyIds: [diversionPlanEKID],
      destinationEntitySetIds: [arrestCaseESID],
      sourceEntitySetIds: [],
    };

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: arrestCaseSearchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[diversionPlanEKID]) {
      const arrestCaseNeighbors :List = fromJS(response.data[diversionPlanEKID]);
      const arrestCaseEKIDs :UUID[] = [];
      arrestCaseNeighbors.forEach((neighbor :Map) => {
        const arrestCase = getNeighborDetails(neighbor);
        arrestCaseEKIDs.push(getEntityKeyId(arrestCase));
      });

      const psaArrestChargeESID :UUID = getEntitySetIdFromApp(app, MANUAL_ARREST_CHARGES);
      const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);

      const arrestChargeSearchFilter = {
        entityKeyIds: arrestCaseEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [psaArrestChargeESID, chargeEventESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: arrestCaseESID, filter: arrestChargeSearchFilter })
      );
      if (response.error) throw response.error;
      const arrestChargeNeighbors :Map = fromJS(response.data);

      if (!arrestChargeNeighbors.isEmpty()) {
        let psaArrestChargesByEKID :Map = Map();
        let cwpChargeEventsByEKID :Map = Map();
        const psaArrestChargeEKIDs :UUID[] = [];
        const cwpChargeEventEKIDs :UUID[] = [];

        arrestChargeNeighbors.forEach((neighborList :List, arrestCaseEKID :UUID) => neighborList
          .forEach((neighbor :Map) => {
            const neighborESID :UUID = getNeighborESID(neighbor);
            const entity :Map = getNeighborDetails(neighbor);
            const chargeOrChargeEventEKID :UUID = getEntityKeyId(entity);
            if (neighborESID === psaArrestChargeESID) {
              psaArrestChargesByEKID = psaArrestChargesByEKID.set(chargeOrChargeEventEKID, entity);
              psaArrestChargeEKIDs.push(chargeOrChargeEventEKID);
              psaArrestCaseByArrestCharge = psaArrestCaseByArrestCharge.set(chargeOrChargeEventEKID, arrestCaseEKID);
            }
            if (neighborESID === chargeEventESID) {
              cwpChargeEventsByEKID = cwpChargeEventsByEKID.set(chargeOrChargeEventEKID, entity);
              cwpChargeEventEKIDs.push(chargeOrChargeEventEKID);
              cwpArrestCaseByArrestCharge = cwpArrestCaseByArrestCharge.set(chargeOrChargeEventEKID, arrestCaseEKID);
            }
          }));

        const cwpArrestChargeESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
        const psaChargeEventSearchFilter = {
          entityKeyIds: psaArrestChargeEKIDs,
          destinationEntitySetIds: [],
          sourceEntitySetIds: [chargeEventESID],
        };
        const cwpChargeSearchFilter = {
          entityKeyIds: cwpChargeEventEKIDs,
          destinationEntitySetIds: [cwpArrestChargeESID],
          sourceEntitySetIds: [],
        };
        let psaChargeEvents :Object = { data: {} };
        if (psaArrestChargeEKIDs.length) {
          psaChargeEvents = yield call(
            searchEntityNeighborsWithFilterWorker,
            searchEntityNeighborsWithFilter({ entitySetId: psaArrestChargeESID, filter: psaChargeEventSearchFilter })
          );
        }
        let cwpArrestCharges :Object = { data: {} };
        if (cwpChargeEventEKIDs.length) {
          cwpArrestCharges = yield call(
            searchEntityNeighborsWithFilterWorker,
            searchEntityNeighborsWithFilter({
              entitySetId: chargeEventESID,
              filter: cwpChargeSearchFilter
            })
          );
        }
        if (psaChargeEvents.error) throw psaChargeEvents.error;
        if (cwpArrestCharges.error) throw cwpArrestCharges.error;
        const psaChargeEventNeighbors :Map = fromJS(psaChargeEvents.data);
        const cwpArrestChargeNeighbors :Map = fromJS(cwpArrestCharges.data);

        if (!psaChargeEventNeighbors.isEmpty()) {
          psaChargeEventNeighbors.forEach((neighborList :List, chargeEKID :UUID) => neighborList
            .forEach((neighbor :Map) => {
              const chargeEvent :Map = getNeighborDetails(neighbor);
              const chargeMap :Map = Map().withMutations((map :Map) => {
                map.set(MANUAL_ARREST_CHARGES, psaArrestChargesByEKID.get(chargeEKID, Map()));
                map.set(CHARGE_EVENT, chargeEvent);
              });
              arrestChargeMapsCreatedInPSA = arrestChargeMapsCreatedInPSA.push(chargeMap);
            }));
        }
        if (!cwpArrestChargeNeighbors.isEmpty()) {
          cwpArrestChargeNeighbors.forEach((neighborList :List, chargeEventEKID :UUID) => neighborList
            .forEach((neighbor :Map) => {
              const arrestCharge :Map = getNeighborDetails(neighbor);
              let chargeMap :Map = Map();
              chargeMap = chargeMap.set(CHARGE_EVENT, cwpChargeEventsByEKID.get(chargeEventEKID, Map()));
              chargeMap = chargeMap.set(ARREST_CHARGE_LIST, arrestCharge);
              arrestChargeMapsCreatedInCWP = arrestChargeMapsCreatedInCWP.push(chargeMap);
              const arrestCaseEKID :UUID = cwpArrestCaseByArrestCharge.get(chargeEventEKID);
              cwpArrestCaseByArrestCharge = cwpArrestCaseByArrestCharge
                .set(getEntityKeyId(arrestCharge), arrestCaseEKID);
              cwpArrestCaseByArrestCharge = cwpArrestCaseByArrestCharge.delete(chargeEventEKID);
            }));
        }
      }
    }

    yield put(getArrestChargesLinkedToCWP.success(id, {
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
      cwpArrestCaseByArrestCharge,
      psaArrestCaseByArrestCharge,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getArrestChargesLinkedToCWP.failure(id, error));
  }
  finally {
    yield put(getArrestChargesLinkedToCWP.finally(id));
  }
  return workerResponse;
}

function* getArrestChargesLinkedToCWPWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ARREST_CHARGES_LINKED_TO_CWP, getArrestChargesLinkedToCWPWorker);
}

/*
 *
 * ChargesActions.getCourtCharges()
 *
 */

function* getCourtChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const workerResponse = {};
  let charges :List = List();

  try {
    yield put(getCourtCharges.request(id));
    const app = yield select(getAppFromState);
    const courtChargeListESID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);

    const response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: courtChargeListESID }));
    if (response.error) {
      throw response.error;
    }
    charges = fromJS(response.data);

    yield put(getCourtCharges.success(id, charges));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
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
    charge event -> registered for -> court charge
    charge event -> appears in -> court case
  */
  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let chargesInCase :List = List();

  try {
    yield put(getCourtChargesForCase.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const { caseEKID } = value;
    const app = yield select(getAppFromState);
    const courtCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const courtChargeListESID :UUID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);

    let searchFilter :Object = {
      entityKeyIds: [caseEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [chargeEventESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: courtCasesESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    let chargeEventByEKID :Map = Map();
    if (response.data[caseEKID]) {
      const chargeEventNeighbors :List = fromJS(response.data[caseEKID]);
      const chargeEventEKIDs = [];
      chargeEventNeighbors.forEach((neighbor :Map) => {
        const chargeEventEntity :Map = getNeighborDetails(neighbor);
        const chargeEventEKID :UUID = getEntityKeyId(chargeEventEntity);
        chargeEventEKIDs.push(chargeEventEKID);
        chargeEventByEKID = chargeEventByEKID.set(chargeEventEKID, chargeEventEntity);
      });


      searchFilter = {
        entityKeyIds: chargeEventEKIDs,
        destinationEntitySetIds: [courtChargeListESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: chargeEventESID, filter: searchFilter })
      );
      if (response.error) throw response.error;

      const courtChargeNeighbors :Map = fromJS(response.data);
      courtChargeNeighbors.forEach((neighbors :List, chargeEventEKID :UUID) => {
        const courtCharge :Map = getNeighborDetails(neighbors.get(0));
        const chargeMap :Map = Map().withMutations((map :Map) => {
          const chargeEvent :Map = chargeEventByEKID.get(chargeEventEKID, Map());
          map.set(CHARGE_EVENT, chargeEvent);
          map.set(COURT_CHARGE_LIST, courtCharge);
        }).asImmutable();
        chargesInCase = chargesInCase.push(chargeMap);
      });
    }

    yield put(getCourtChargesForCase.success(id, chargesInCase));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
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
 * ChargesActions.getArrestCasesAndChargesFromPSA()
 *
 */

function* getArrestCasesAndChargesFromPSAWorker(action :SequenceAction) :Generator<*, *, *> {

  /*
    person -> charged with -> charge (datetime stored on charged with)
    charge -> appears in -> case
  */
  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let arrestCaseByArrestChargeEKIDFromPSA :Map = Map();
  let arrestChargesFromPSA :List = List();

  try {
    yield put(getArrestCasesAndChargesFromPSA.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const arrestCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_ARREST_CASES);

    // person -> appears in -> case
    let searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [arrestCasesESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[personEKID]) {
      const arrestCaseNeighbors :List = fromJS(response.data[personEKID]);
      let arrestCaseEntityByItsEKID :Map = Map();
      const arrestCaseEKIDs :string[] = [];
      arrestCaseNeighbors.forEach((neighbor :Map) => {
        const entity :Map = getNeighborDetails(neighbor);
        const ekid :UUID = getEntityKeyId(entity);
        arrestCaseEKIDs.push(ekid);
        arrestCaseEntityByItsEKID = arrestCaseEntityByItsEKID.set(ekid, entity);
      });
      const arrestChargesESID :UUID = getEntitySetIdFromApp(app, MANUAL_ARREST_CHARGES);
      // charge -> appears in -> case
      searchFilter = {
        entityKeyIds: arrestCaseEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [arrestChargesESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: arrestCasesESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const arrestChargesNeighbors :Map = fromJS(response.data);
      if (!arrestChargesNeighbors.isEmpty()) {

        const listOfChargeEKIDsByArrestCaseEKID :Map = arrestChargesNeighbors
          .map((neighborList :Map) => neighborList
            .map((neighbor :Map) => getNeighborDetails(neighbor))
            .map((entity :Map) => getEntityKeyId(entity)));
        listOfChargeEKIDsByArrestCaseEKID.forEach((listOfChargeEKIDs :List, arrestCaseEKID :UUID) => {
          listOfChargeEKIDs.forEach((chargeEKID :UUID) => {
            const arrestCase :Map = arrestCaseEntityByItsEKID.get(arrestCaseEKID, Map());
            arrestCaseByArrestChargeEKIDFromPSA = arrestCaseByArrestChargeEKIDFromPSA
              .set(chargeEKID, arrestCase);
          });
        });

        arrestChargesFromPSA = arrestChargesNeighbors
          .map((neighborList :Map) => neighborList
            .map((neighbor :Map) => getNeighborDetails(neighbor)))
          .valueSeq()
          .toList()
          .flatten(true);
      }
    }

    yield put(getArrestCasesAndChargesFromPSA.success(id, {
      arrestCaseByArrestChargeEKIDFromPSA,
      arrestChargesFromPSA,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getArrestCasesAndChargesFromPSA.failure(id, error));
  }
  finally {
    yield put(getArrestCasesAndChargesFromPSA.finally(id));
  }
  return workerResponse;
}

function* getArrestCasesAndChargesFromPSAWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ARREST_CASES_AND_CHARGES_FROM_PSA, getArrestCasesAndChargesFromPSAWorker);
}

/*
 *
 * ChargesActions.removeArrestCharge()
 *
 */

function* removeArrestChargeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :{} = {};

  try {
    yield put(removeArrestCharge.request(id, value));

    const { associationToDelete, entitiesToDelete, path } = value;
    const completeListOfEntitiesToDelete :Object[] = entitiesToDelete;
    const { dstESID, srcEKID, srcESID } = associationToDelete;

    const searchFilter = {
      entityKeyIds: [srcEKID],
      destinationEntitySetIds: [dstESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: srcESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[srcEKID]) {
      const neighbor :Map = fromJS(response.data[srcEKID][0]);
      const associationEntity :Map = neighbor.get(ASSOCIATION_DETAILS);
      const associationEKID :UUID = getEntityKeyId(associationEntity);
      const associationESID :UUID = getAssociationNeighborESID(neighbor);
      completeListOfEntitiesToDelete.push({
        entitySetId: associationESID,
        entityKeyId: associationEKID
      });
    }

    response = yield call(deleteEntitiesWorker, deleteEntities(entitiesToDelete));
    if (response.error) {
      throw response.error;
    }

    yield put(removeArrestCharge.success(id, path));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(removeArrestCharge.failure(id, error));
  }
  finally {
    yield put(removeArrestCharge.finally(id));
  }
}

function* removeArrestChargeWatcher() :Generator<*, *, *> {

  yield takeEvery(REMOVE_ARREST_CHARGE, removeArrestChargeWorker);
}

/*
 *
 * ChargesActions.removeCourtChargeFromCase()
 *
 */

function* removeCourtChargeFromCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};

  try {
    yield put(removeCourtChargeFromCase.request(id, value));

    const { entityData, path } = value;

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
    if (response.error) throw response.error;

    yield put(removeCourtChargeFromCase.success(id, path));
  }
  catch (error) {
    LOG.error(action.type, error);
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
  addArrestChargesWatcher,
  addArrestChargesWorker,
  addCourtChargesToCaseWatcher,
  addCourtChargesToCaseWorker,
  addToAvailableArrestChargesWatcher,
  addToAvailableArrestChargesWorker,
  addToAvailableCourtChargesWatcher,
  addToAvailableCourtChargesWorker,
  getArrestCasesAndChargesFromPSAWatcher,
  getArrestCasesAndChargesFromPSAWorker,
  getArrestChargesLinkedToCWPWatcher,
  getArrestChargesLinkedToCWPWorker,
  getArrestChargesWatcher,
  getArrestChargesWorker,
  getCourtChargesForCaseWatcher,
  getCourtChargesForCaseWorker,
  getCourtChargesWatcher,
  getCourtChargesWorker,
  removeArrestChargeWatcher,
  removeArrestChargeWorker,
  removeCourtChargeFromCaseWatcher,
  removeCourtChargeFromCaseWorker,
};
