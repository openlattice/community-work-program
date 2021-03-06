/*
 * @flow
 */

import FS from 'file-saver';
import Papa from 'papaparse';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_CHARGES_STATS,
  GET_CHARGES_STATS,
  GET_INDIVIDUAL_CHARGE_TYPE_STATS,
  downloadChargesStats,
  getChargesStats,
  getIndividualChargeTypeStats,
} from './ChargesStatsActions';

import Logger from '../../../utils/Logger';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined } from '../../../utils/LangUtils';
import { STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
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
  PEOPLE,
} = APP_TYPE_FQNS;
const { OL_ID, NAME, LEVEL_STATE } = PROPERTY_TYPE_FQNS;
const { ARREST_CHARGE_TABLE_DATA, COURT_CHARGE_TABLE_DATA } = STATS;
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
        newDataObj[ARREST_CHARGE_HEADERS[2]] = tableRow.get(ARREST_CHARGE_HEADERS[2]);
        fileName = 'Arrest_Charges_Stats';
      }
      if (tableRow.get(COURT_CHARGE_HEADERS[0])) {
        newDataObj[COURT_CHARGE_HEADERS[0]] = tableRow.get(COURT_CHARGE_HEADERS[0]);
        newDataObj[COURT_CHARGE_HEADERS[1]] = tableRow.get(COURT_CHARGE_HEADERS[1]);
        newDataObj[COURT_CHARGE_HEADERS[2]] = tableRow.get(COURT_CHARGE_HEADERS[2]);
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
 * ChargesStatsActions.getIndividualChargeTypeStats()
 *
 */

function* getIndividualChargeTypeStatsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  const workerResponse :Object = {};
  let arrestChargeTableData :List = List().asMutable();

  try {
    yield put(getIndividualChargeTypeStats.request(id));
    const { chargeESID, mapInStateToUpdate, tableHeaders } = value;

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :List = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));
    const diversionPlanEKIDs :UUID[] = [];
    diversionPlans.forEach((plan :Map) => diversionPlanEKIDs.push(getEntityKeyId(plan)));

    const chargeEventESID :UUID = getEntitySetIdFromApp(app, CHARGE_EVENT);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    let searchFilter :Object = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [chargeEventESID],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const diversionPlanNeighbors :Map = fromJS(response.data);

    const chargeEventEKIDs :UUID[] = [];
    let diversionPlanEKIDByChargeEventEKID :Map = Map().asMutable();
    let personEKIDByDiversionPlanEKID :Map = Map().asMutable();

    diversionPlanNeighbors.forEach((neighborsList :List, diversionPlanEKID :UUID) => {
      const chargeEventNeighbors :List = neighborsList
        .filter((neighbor :Map) => getNeighborESID(neighbor) === chargeEventESID);
      chargeEventNeighbors.forEach((chargeEventNeighbor :Map) => {
        const chargeEventEKID :UUID = getEntityKeyId(getNeighborDetails(chargeEventNeighbor));
        chargeEventEKIDs.push(chargeEventEKID);
        diversionPlanEKIDByChargeEventEKID = diversionPlanEKIDByChargeEventEKID
          .set(chargeEventEKID, diversionPlanEKID);
      });

      const personNeighbor :Map = neighborsList.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
      const personEKID :UUID = getEntityKeyId(getNeighborDetails(personNeighbor));
      personEKIDByDiversionPlanEKID = personEKIDByDiversionPlanEKID.set(diversionPlanEKID, personEKID);
    });

    // const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
    if (chargeEventESID.length) {
      searchFilter = {
        entityKeyIds: chargeEventEKIDs,
        destinationEntitySetIds: [chargeESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: chargeEventESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const arrestChargeNeighbors :Map = fromJS(response.data);

      Map().withMutations((map :Map) => {

        arrestChargeNeighbors.forEach((neighborsList :List, chargeEventEKID :UUID) => {
          const arrestCharge :Map = getNeighborDetails(neighborsList.get(0));
          const { [OL_ID]: statuteNumber, [NAME]: chargeName, [LEVEL_STATE]: level } = getEntityProperties(
            arrestCharge,
            [OL_ID, NAME, LEVEL_STATE]
          );
          const fullChargeString :string = `${statuteNumber} ${chargeName} ${level}`;
          const arrestChargeCount :number = map.get(fullChargeString, 0);

          const diversionPlanEKID :UUID = diversionPlanEKIDByChargeEventEKID.get(chargeEventEKID, '');
          const personEKID :UUID = personEKIDByDiversionPlanEKID.get(diversionPlanEKID, '');
          map.updateIn([personEKID, diversionPlanEKID], List(), (list) => list.push(fullChargeString));

          if (arrestChargeCount !== 0) {
            const index :Map = arrestChargeTableData
              .findIndex((row :Map) => row.get(tableHeaders[0]) === fullChargeString);
            arrestChargeTableData = arrestChargeTableData
              .setIn([index, tableHeaders[1]], arrestChargeCount + 1);
          }
          else {
            arrestChargeTableData = arrestChargeTableData.push(Map({
              [tableHeaders[0]]: fullChargeString,
              [tableHeaders[1]]: arrestChargeCount + 1,
              id: `${chargeEventEKID}.${getEntityKeyId(arrestCharge)}`
            }));
          }

          map.set(fullChargeString, arrestChargeCount + 1);
        });
      });
    }

    arrestChargeTableData = arrestChargeTableData.asImmutable();
    workerResponse.data = arrestChargeTableData;
    yield put(getIndividualChargeTypeStats.success(id, { arrestChargeTableData, mapInStateToUpdate }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getIndividualChargeTypeStats.failure(id, error));
  }
  finally {
    yield put(getIndividualChargeTypeStats.finally(id));
  }
  return workerResponse;
}

function* getIndividualChargeTypeStatsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INDIVIDUAL_CHARGE_TYPE_STATS, getIndividualChargeTypeStatsWorker);
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

    const app = yield select(getAppFromState);
    const arrestChargeListESID :UUID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
    const courtChargeListESID :UUID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);

    const [arrestResponse, courtResponse] = yield all([
      call(getIndividualChargeTypeStatsWorker, getIndividualChargeTypeStats({
        chargeESID: arrestChargeListESID,
        mapInStateToUpdate: ARREST_CHARGE_TABLE_DATA,
        tableHeaders: ARREST_CHARGE_HEADERS
      })),
      call(getIndividualChargeTypeStatsWorker, getIndividualChargeTypeStats({
        chargeESID: courtChargeListESID,
        mapInStateToUpdate: COURT_CHARGE_TABLE_DATA,
        tableHeaders: COURT_CHARGE_HEADERS
      })),
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
  getChargesStatsWatcher,
  getChargesStatsWorker,
  getIndividualChargeTypeStatsWatcher,
  getIndividualChargeTypeStatsWorker,
};
