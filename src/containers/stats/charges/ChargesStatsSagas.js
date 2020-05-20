// @flow
import Papa from 'papaparse';
import FS from 'file-saver';
import { List, Map, fromJS } from 'immutable';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import {
  DOWNLOAD_CHARGES_STATS,
  GET_ARREST_CHARGE_STATS,
  GET_CHARGES_STATS,
  GET_COURT_CHARGE_STATS,
  downloadChargesStats,
  getArrestChargeStats,
  getChargesStats,
  getCourtChargeStats,
} from './ChargesStatsActions';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ARREST_CHARGE_HEADERS, COURT_CHARGE_HEADERS } from '../consts/StatsConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  CHARGE_EVENT,
} = APP_TYPE_FQNS;
const { OL_ID, NAME, LEVEL_STATE } = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());
const LOG = new Logger('ChargesStatsSagas');

/*
 *
 * ChargesStatsActions.downloadChargesStats()
 *
 */

function* downloadChargesStatsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(downloadChargesStats.request(id));
    const chargesTableData :List = value;

    let fileName :string = '';
    let csvData :Object[] = [];
    chargesTableData.forEach((tableRow :Map) => {
      const newDataObj :Object = {};
      if (tableRow.get(ARREST_CHARGE_HEADERS[0])) {
        newDataObj[ARREST_CHARGE_HEADERS[0]] = tableRow.get(ARREST_CHARGE_HEADERS[0]);
        newDataObj[ARREST_CHARGE_HEADERS[1]] = tableRow.get(ARREST_CHARGE_HEADERS[1]);
        fileName = 'Arrest_Charges_Stats';
      }
      if (tableRow.get(COURT_CHARGE_HEADERS[0])) {
        newDataObj[COURT_CHARGE_HEADERS[0]] = tableRow.get(COURT_CHARGE_HEADERS[0]);
        newDataObj[COURT_CHARGE_HEADERS[1]] = tableRow.get(COURT_CHARGE_HEADERS[1]);
        fileName = 'Court_Charges_Stats';
      }
      csvData.push(newDataObj);
    });

    csvData = csvData.sort((row1 :Object, row2 :Object) => {
      // 1st position value is the same in both arrays
      if (row1[COURT_CHARGE_HEADERS[1]] < row2[COURT_CHARGE_HEADERS[1]]) return -1;
      if (row1[COURT_CHARGE_HEADERS[1]] > row2[COURT_CHARGE_HEADERS[1]]) return 1;
      return 0;
    }).reverse();

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], {
      type: 'application/json'
    });
    FS.saveAs(blob, fileName.concat('.csv'));
    yield put(downloadChargesStats.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadChargesStats.failure(id, error));
  }
  finally {
    yield put(downloadChargesStats.finally(id));
  }
}

function* downloadChargesStatsWatcher() :Generator<*, *, *> {

  yield takeEvery(DOWNLOAD_CHARGES_STATS, downloadChargesStatsWorker);
}

/*
 *
 * ChargesStatsActions.getArrestChargeStats()
 *
 */

function* getArrestChargeStatsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  const workerResponse :Object = {};
  let arrestChargeTableData :List = List().asMutable();

  try {
    yield put(getArrestChargeStats.request(id));

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :List = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));
    const diversionPlanEKIDs :UUID[] = [];
    diversionPlans.forEach((plan :Map) => diversionPlanEKIDs.push(getEntityKeyId(plan)));

    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    let searchFilter :Object = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [chargeEventESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const chargeEventNeighbors :Map = fromJS(response.data);

    const chargeEventEKIDs :UUID[] = [];
    chargeEventNeighbors.forEach((neighborsList :List) => {
      neighborsList.forEach((neighbor :Map) => chargeEventEKIDs.push(getEntityKeyId(getNeighborDetails(neighbor))));
    });

    const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
    if (chargeEventESID.length) {
      searchFilter = {
        entityKeyIds: chargeEventEKIDs,
        destinationEntitySetIds: [arrestChargeListESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: chargeEventESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const arrestChargeNeighbors :Map = fromJS(response.data);

      let arrestChargeCounts :Map = Map().asMutable();
      arrestChargeNeighbors.forEach((neighborsList :List, chargeEventEKID :UUID) => {
        const arrestCharge :Map = getNeighborDetails(neighborsList.get(0));
        const { [OL_ID]: statuteNumber, [NAME]: chargeName, [LEVEL_STATE]: level } = getEntityProperties(
          arrestCharge,
          [OL_ID, NAME, LEVEL_STATE]
        );
        const fullChargeString :string = `${statuteNumber} ${chargeName} ${level}`;
        const arrestChargeCount :number = arrestChargeCounts.get(fullChargeString, 0);

        if (arrestChargeCount !== 0) {
          const index :Map = arrestChargeTableData
            .findIndex((map :Map) => map.get(ARREST_CHARGE_HEADERS[0]) === fullChargeString);
          arrestChargeTableData = arrestChargeTableData.setIn([index, ARREST_CHARGE_HEADERS[1]], arrestChargeCount + 1);
        }
        else {
          arrestChargeTableData = arrestChargeTableData.push(Map({
            [ARREST_CHARGE_HEADERS[0]]: fullChargeString,
            [ARREST_CHARGE_HEADERS[1]]: arrestChargeCount + 1,
            id: `${chargeEventEKID}.${getEntityKeyId(arrestCharge)}`
          }));
        }

        arrestChargeCounts = arrestChargeCounts.set(fullChargeString, arrestChargeCount + 1);
      });
    }

    arrestChargeTableData = arrestChargeTableData.asImmutable();
    workerResponse.data = arrestChargeTableData;
    yield put(getArrestChargeStats.success(id, arrestChargeTableData));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getArrestChargeStats.failure(id, error));
  }
  finally {
    yield put(getArrestChargeStats.finally(id));
  }
  return workerResponse;
}

function* getArrestChargeStatsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ARREST_CHARGE_STATS, getArrestChargeStatsWorker);
}

/*
 *
 * ChargesStatsActions.getCourtChargeStats()
 *
 */

function* getCourtChargeStatsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  const workerResponse :Object = {};
  let courtChargeTableData :List = List().asMutable();

  try {
    yield put(getCourtChargeStats.request(id));

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :List = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));
    const diversionPlanEKIDs :UUID[] = [];
    diversionPlans.forEach((plan :Map) => diversionPlanEKIDs.push(getEntityKeyId(plan)));

    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    let searchFilter :Object = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [chargeEventESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const chargeEventNeighbors :Map = fromJS(response.data);

    const chargeEventEKIDs :UUID[] = [];
    chargeEventNeighbors.forEach((neighborsList :List) => {
      neighborsList.forEach((neighbor :Map) => chargeEventEKIDs.push(getEntityKeyId(getNeighborDetails(neighbor))));
    });

    const courtChargeListESID :UUID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
    if (chargeEventESID.length) {
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

      let courtChargeCounts :Map = Map().asMutable();
      courtChargeNeighbors.forEach((neighborsList :List, chargeEventEKID :UUID) => {
        const courtCharge :Map = getNeighborDetails(neighborsList.get(0));
        const { [OL_ID]: statuteNumber, [NAME]: chargeName } = getEntityProperties(courtCharge, [OL_ID, NAME]);
        const fullChargeString :string = `${statuteNumber} ${chargeName}`;
        const courtChargeCount :number = courtChargeCounts.get(fullChargeString, 0);

        if (courtChargeCount !== 0) {
          const index :Map = courtChargeTableData
            .findIndex((map :Map) => map.get(COURT_CHARGE_HEADERS[0]) === fullChargeString);
          courtChargeTableData = courtChargeTableData.setIn([index, COURT_CHARGE_HEADERS[1]], courtChargeCount + 1);
        }
        else {
          courtChargeTableData = courtChargeTableData.push(Map({
            [COURT_CHARGE_HEADERS[0]]: fullChargeString,
            [COURT_CHARGE_HEADERS[1]]: courtChargeCount + 1,
            id: `${chargeEventEKID}.${getEntityKeyId(courtCharge)}`
          }));
        }

        courtChargeCounts = courtChargeCounts.set(fullChargeString, courtChargeCount + 1);
      });
    }

    courtChargeTableData = courtChargeTableData.asImmutable();
    workerResponse.data = courtChargeTableData;
    yield put(getCourtChargeStats.success(id, courtChargeTableData));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getCourtChargeStats.failure(id, error));
  }
  finally {
    yield put(getCourtChargeStats.finally(id));
  }
  return workerResponse;
}

function* getCourtChargeStatsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_COURT_CHARGE_STATS, getCourtChargeStatsWorker);
}

/*
 *
 * ChargesStatsActions.getChargesStats()
 *
 */

function* getChargesStatsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;

  try {
    yield put(getChargesStats.request(id));

    const [arrestResponse, courtResponse] = yield all([
      call(getArrestChargeStatsWorker, getArrestChargeStats()),
      call(getCourtChargeStatsWorker, getCourtChargeStats()),
    ]);
    if (arrestResponse.error) throw arrestResponse.error;
    if (courtResponse.error) throw courtResponse.error;

    yield put(getChargesStats.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getChargesStats.failure(id, error));
  }
  finally {
    yield put(getChargesStats.finally(id));
  }
}

function* getChargesStatsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CHARGES_STATS, getChargesStatsWorker);
}

export {
  downloadChargesStatsWatcher,
  downloadChargesStatsWorker,
  getArrestChargeStatsWatcher,
  getArrestChargeStatsWorker,
  getCourtChargeStatsWatcher,
  getCourtChargeStatsWorker,
  getChargesStatsWatcher,
};
