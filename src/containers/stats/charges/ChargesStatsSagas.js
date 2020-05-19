// @flow
import { List, Map, fromJS } from 'immutable';
import {
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
import {
  GET_ARREST_CHARGE_STATS,
  getArrestChargeStats,
} from './ChargesStatsActions';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  ARREST_CHARGE_LIST,
  DIVERSION_PLAN,
  CHARGE_EVENT,
} = APP_TYPE_FQNS;
const { OL_ID, NAME, LEVEL_STATE } = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());
const LOG = new Logger('ChargesStatsSagas');

/*
 *
 * ChargesStatsActions.getArrestChargeStats()
 *
 */

function* getArrestChargeStatsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  let arrestChargeTableData :List = List().asMutable();

  try {
    yield put(getArrestChargeStats.request(id));

    /*
      get all diversion plans
      get all charge events tied to div plans
      get all arrest charges tied to those charge events
    */

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
      arrestChargeNeighbors.forEach((neighborsList :List) => {
        const arrestCharge :Map = getNeighborDetails(neighborsList.get(0));
        const { [OL_ID]: statuteNumber, [NAME]: chargeName, [LEVEL_STATE]: level } = getEntityProperties(
          arrestCharge,
          [OL_ID, NAME, LEVEL_STATE]
        );
        const fullChargeString :string = `${statuteNumber} ${chargeName} ${level}`;
        const arrestChargeCount :number = arrestChargeCounts.get(fullChargeString, 0);

        if (arrestChargeCount !== 0) {
          const index :Map = arrestChargeTableData.findIndex((map :Map) => map.get('charge') === fullChargeString);
          arrestChargeTableData = arrestChargeTableData.setIn([index, 'count'], arrestChargeCount + 1);
        }
        else {
          arrestChargeTableData = arrestChargeTableData.push(Map({
            charge: fullChargeString,
            count: arrestChargeCount + 1,
          }));
        }

        arrestChargeCounts = arrestChargeCounts.set(fullChargeString, arrestChargeCount + 1);
      });
    }

    arrestChargeTableData = arrestChargeTableData.asImmutable();
    yield put(getArrestChargeStats.success(id, arrestChargeTableData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getArrestChargeStats.failure(id, error));
  }
  finally {
    yield put(getArrestChargeStats.finally(id));
  }
}

function* getArrestChargeStatsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ARREST_CHARGE_STATS, getArrestChargeStatsWorker);
}

export {
  getArrestChargeStatsWatcher,
  getArrestChargeStatsWorker,
};
