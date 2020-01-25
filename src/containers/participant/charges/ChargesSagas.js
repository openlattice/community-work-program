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
  getNeighborESID,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
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
  removeCourtChargeFromCase,
} from './ChargesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { CHARGES, PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { ASSOCIATION_DETAILS } from '../../../core/edm/constants/DataModelConsts';

const { getPageSectionKey, getEntityAddressKey, processAssociationEntityData } = DataProcessingUtils;
const { FullyQualifiedName } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPEARS_IN,
  APPEARS_IN_ARREST,
  ARREST_CHARGE_LIST,
  CHARGE_EVENT,
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  MANUAL_ARREST_CASES,
  MANUAL_ARREST_CHARGES,
  MANUAL_CHARGED_WITH,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  REGISTERED_FOR,
} = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA, ARREST_CHARGES_BY_EKID, ARREST_CHARGES_FROM_PSA } = CHARGES;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getChargesFromState = (state) => state.get(STATE.CHARGES, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const getPersonFromState = (state) => state.get(STATE.PERSON, Map());
const LOG = new Logger('ChargesSagas');

/*
 *
 * ChargesActions.addArrestCharges()
 *
 */

function* addArrestChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse = {};
  let response :Object = {};
  let arrestChargeMapsCreatedInCWP :List = List();
  let arrestChargeMapsCreatedInPSA :List = List();
  let psaArrestCaseByArrestCharge :Map = Map();
  let cwpArrestCaseByArrestCharge :Map = Map();

  try {
    yield put(addArrestCharges.request(id, value));
    console.log('value: ', value);
    const { associationEntityData, entityData } = value;

    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) {
      throw response.error;
    }

    const { entityKeyIds } = response.data;
    const { entitySetIds } = response.data;
    console.log('entityKeyIds: ', entityKeyIds);
    console.log('entitySetIds: ', entitySetIds);
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const chargesState = yield select(getChargesFromState);
    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    const chargeEventEKIDs :UUID[] = entityKeyIds[chargeEventESID];
    console.log('chargeEventEKIDs: ', chargeEventEKIDs);
    chargeEventEKIDs.forEach((ekid :UUID, index :number) => {
      let newChargeMap :Map = Map();
      // construct charge event entity:
      let newChargeEvent :Map = Map();
      newChargeEvent = newChargeEvent.set(ENTITY_KEY_ID, ekid);
      const datetimeCompletedPTID :string = getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED);
      const datetimeCompleted :string[] = entityData[chargeEventESID][index][datetimeCompletedPTID];
      newChargeEvent = newChargeEvent.set(DATETIME_COMPLETED, datetimeCompleted);
      newChargeMap = newChargeMap.set(CHARGE_EVENT, newChargeEvent);
      // find associated charge:
      const registeredForESID :UUID = getEntitySetIdFromApp(app, REGISTERED_FOR);
      const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
      const manualArrestChargeESID :UUID = getEntitySetIdFromApp(app, MANUAL_ARREST_CHARGES);
      const appearsInArrestESID :UUID = getEntitySetIdFromApp(app, APPEARS_IN_ARREST);
      const chargeEventToChargeAssociation :Object = associationEntityData[registeredForESID][index];
      const arrestChargesByEKID :Map = chargesState.get(ARREST_CHARGES_BY_EKID, Map());
      const arrestChargesFromPSA :List = chargesState.get(ARREST_CHARGES_FROM_PSA, List());
      const arrestCaseEKIDByArrestChargeEKIDFromPSA :Map = chargesState
        .get(ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA, Map());
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
        newChargeMap = newChargeMap.set(MANUAL_ARREST_CASES, charge);
        arrestChargeMapsCreatedInPSA = arrestChargeMapsCreatedInPSA.push(newChargeMap);

        const chargeEKID :UUID = getEntityKeyId(charge);
        const caseEKID :UUID = arrestCaseEKIDByArrestChargeEKIDFromPSA.get(chargeEKID, '');
        psaArrestCaseByArrestCharge = psaArrestCaseByArrestCharge.set(chargeEKID, caseEKID);
      }
    });
    console.log('arrestChargeMapsCreatedInCWP: ', arrestChargeMapsCreatedInCWP.toJS());
    console.log('arrestChargeMapsCreatedInPSA: ', arrestChargeMapsCreatedInPSA.toJS());
    console.log('cwpArrestCaseByArrestCharge: ', cwpArrestCaseByArrestCharge.toJS());
    console.log('psaArrestCaseByArrestCharge: ', psaArrestCaseByArrestCharge.toJS());

    yield put(addArrestCharges.success(id, {
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
      cwpArrestCaseByArrestCharge,
      psaArrestCaseByArrestCharge,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addArrestChargesWorker()', error);
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
 * ChargesActions.addToAvailableArrestCharges()
 *
 */

function* addToAvailableArrestChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(addToAvailableArrestCharges.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
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
    LOG.error('caught exception in addToAvailableArrestChargesWorker()', error);
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
  let arrestChargesByEKID :Map = Map();

  try {
    yield put(getArrestCharges.request(id));
    const app = yield select(getAppFromState);
    const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: arrestChargeListESID }));
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
      const cwpArrestChargeESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);

      const arrestChargeSearchFilter = {
        entityKeyIds: arrestCaseEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [psaArrestChargeESID, cwpArrestChargeESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: arrestCaseESID, filter: arrestChargeSearchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const arrestChargeNeighbors :Map = fromJS(response.data);
      if (!arrestChargeNeighbors.isEmpty()) {
        let psaArrestChargesByEKID :Map = Map();
        let cwpArrestChargesByEKID :Map = Map();
        const psaArrestChargeEKIDs :UUID[] = [];
        const cwpArrestChargeEKIDs :UUID[] = [];

        arrestChargeNeighbors.forEach((neighborList :List, arrestCaseEKID :UUID) => neighborList
          .forEach((neighbor :Map) => {
            const neighborESID :UUID = getNeighborESID(neighbor);
            const entity :Map = getNeighborDetails(neighbor);
            const chargeEKID :UUID = getEntityKeyId(entity);
            if (neighborESID === psaArrestChargeESID) {
              psaArrestChargesByEKID = psaArrestChargesByEKID.set(chargeEKID, entity);
              psaArrestChargeEKIDs.push(chargeEKID);
              psaArrestCaseByArrestCharge = psaArrestCaseByArrestCharge.set(chargeEKID, arrestCaseEKID);
            }
            if (neighborESID === cwpArrestChargeESID) {
              cwpArrestChargesByEKID = cwpArrestChargesByEKID.set(chargeEKID, entity);
              cwpArrestChargeEKIDs.push(chargeEKID);
              cwpArrestCaseByArrestCharge = cwpArrestCaseByArrestCharge.set(chargeEKID, arrestCaseEKID);
            }
          }));

        const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
        const psaChargeEventSearchFilter = {
          entityKeyIds: psaArrestChargeEKIDs,
          destinationEntitySetIds: [],
          sourceEntitySetIds: [chargeEventESID],
        };
        const cwpChargeEventSearchFilter = {
          entityKeyIds: cwpArrestChargeEKIDs,
          destinationEntitySetIds: [],
          sourceEntitySetIds: [chargeEventESID],
        };
        let psaChargeEvents :Object = { data: {} };
        if (psaArrestChargeEKIDs.length) {
          psaChargeEvents = yield call(
            searchEntityNeighborsWithFilterWorker,
            searchEntityNeighborsWithFilter({ entitySetId: psaArrestChargeESID, filter: psaChargeEventSearchFilter })
          );
        }
        let cwpChargeEvents :Object = { data: {} };
        if (cwpArrestChargeEKIDs.length) {
          cwpChargeEvents = yield call(
            searchEntityNeighborsWithFilterWorker,
            searchEntityNeighborsWithFilter({ entitySetId: cwpArrestChargeESID, filter: cwpChargeEventSearchFilter })
          );
        }
        if (psaChargeEvents.error) {
          throw psaChargeEvents.error;
        }
        if (cwpChargeEvents.error) {
          throw cwpChargeEvents.error;
        }
        const psaChargeEventNeighbors :Map = fromJS(psaChargeEvents.data);
        console.log('psaChargeEventNeighbors: ', psaChargeEvents.data);
        const cwpChargeEventNeighbors :Map = fromJS(cwpChargeEvents.data);
        if (!psaChargeEventNeighbors.isEmpty()) {
          psaChargeEventNeighbors.forEach((neighborList :List, chargeEKID :UUID) => neighborList
            .forEach((neighbor :Map) => {
              const chargeEvent :Map = getNeighborDetails(neighbor);
              let chargeMap :Map = Map();
              chargeMap = chargeMap.set(MANUAL_ARREST_CHARGES, psaArrestChargesByEKID.get(chargeEKID, Map()));
              chargeMap = chargeMap.set(CHARGE_EVENT, chargeEvent);
              arrestChargeMapsCreatedInPSA = arrestChargeMapsCreatedInPSA.push(chargeMap);
            }));
        }
        if (!cwpChargeEventNeighbors.isEmpty()) {
          cwpChargeEventNeighbors.forEach((neighborList :List, chargeEKID :UUID) => neighborList
            .forEach((neighbor :Map) => {
              const chargeEvent :Map = getNeighborDetails(neighbor);
              let chargeMap :Map = Map();
              chargeMap = chargeMap.set(ARREST_CHARGE_LIST, cwpArrestChargesByEKID.get(chargeEKID, Map()));
              chargeMap = chargeMap.set(CHARGE_EVENT, chargeEvent);
              arrestChargeMapsCreatedInCWP = arrestChargeMapsCreatedInCWP.push(chargeMap);
            }));
        }
      }
    }

    console.log('arrestChargeMapsCreatedInCWP: ', arrestChargeMapsCreatedInCWP.toJS());
    console.log('arrestChargeMapsCreatedInPSA: ', arrestChargeMapsCreatedInPSA.toJS());
    console.log('cwpArrestCaseByArrestCharge: ', cwpArrestCaseByArrestCharge.toJS());
    console.log('psaArrestCaseByArrestCharge: ', psaArrestCaseByArrestCharge.toJS());

    yield put(getArrestChargesLinkedToCWP.success(id, {
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
      cwpArrestCaseByArrestCharge,
      psaArrestCaseByArrestCharge,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getArrestChargesLinkedToCWPWorker()', error);
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
  let arrestCaseEKIDByArrestChargeEKIDFromPSA :Map = Map();
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
      const arrestCaseEKIDs :string[] = [];
      arrestCaseNeighbors.forEach((neighbor :Map) => {
        const entity :Map = getNeighborDetails(neighbor);
        const ekid :UUID = getEntityKeyId(entity);
        arrestCaseEKIDs.push(ekid);
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
            arrestCaseEKIDByArrestChargeEKIDFromPSA = arrestCaseEKIDByArrestChargeEKIDFromPSA
              .set(chargeEKID, arrestCaseEKID);
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
      arrestCaseEKIDByArrestChargeEKIDFromPSA,
      arrestChargesFromPSA,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getArrestCasesAndChargesFromPSAWorker()', error);
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
  removeCourtChargeFromCaseWatcher,
  removeCourtChargeFromCaseWorker,
};
