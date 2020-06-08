// @flow
import Papa from 'papaparse';
import FS from 'file-saver';
import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
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
import { getDemographicsFromPersonData } from '../utils/DemographicsUtils';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getPropertyTypeIdFromEdm,
  getUTCDateRangeSearchString,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_MONTHLY_DEMOGRAPHICS,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getMonthlyDemographics,
  getParticipantsDemographics,
} from './DemographicsActions';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { ACTIVE_STATUSES } from '../consts/CourtTypeConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { DIVERSION_PLAN, ENROLLMENT_STATUS, PEOPLE } = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, STATUS } = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const LOG = new Logger('DemographicsSagas');

/*
 *
 * DemographicsSagas.downloadDemographicsData()
 *
 */

function* downloadDemographicsDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(downloadDemographicsData.request(id));

    const { chartData, valuesNotFound } = value;
    let csvData :Object[] = chartData.map((chartObj :Object) => {
      const newChartObj :Object = {};
      newChartObj.demographic = chartObj.name;
      newChartObj.count = chartObj.count;
      newChartObj.percentage = chartObj.label;
      return newChartObj;
    });
    valuesNotFound.forEach((demographic :string) => csvData.push({
      demographic,
      count: 0,
      percentage: '0%',
    }));
    csvData = csvData.sort((row1 :Object, row2 :Object) => {
      if (row1.demographic < row2.demographic) return -1;
      if (row1.demographic > row2.demographic) return 1;
      return 0;
    });

    const countTotal :number = csvData.map((obj :Object) => obj.count)
      .reduce((sum :number, count :number) => sum + count);
    const total = {
      demographic: 'Total',
      count: countTotal,
      percentage: '100%',
    };
    csvData.push(total);

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], {
      type: 'application/json'
    });
    const fileName :string = 'CWP_Race_Demographics';
    FS.saveAs(blob, fileName.concat('.csv'));
    yield put(downloadDemographicsData.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadDemographicsData.failure(id, error));
  }
  finally {
    yield put(downloadDemographicsData.finally(id));
  }
}

function* downloadDemographicsDataWatcher() :Generator<*, *, *> {

  yield takeEvery(DOWNLOAD_DEMOGRAPHICS_DATA, downloadDemographicsDataWorker);
}

/*
 *
 * DemographicsSagas.getMonthlyDemographics()
 *
 */

function* getMonthlyDemographicsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  let nonDuplicatedPersonMap :Map = Map();

  try {
    yield put(getMonthlyDemographics.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { month, year } = value;

    /*
      Get all active participants for a given month. Return their demographics.
      1. Search for enrollment statuses with effective dates within that month.
      2. Filter out non-active statuses.
      3. Find diversion plan neighbors, and then person neighbors.
    */

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const effectiveDatePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);
    const searchOptions = {
      entitySetIds: [enrollmentStatusESID],
      start: 0,
      maxHits: 10000,
      constraints: []
    };

    let searchTerm :string = '';

    const mmMonth :string = month < 10 ? `0${month}` : month;
    const firstDateOfMonth :DateTime = DateTime.fromISO(`${year}-${mmMonth}-01`);
    searchTerm = getUTCDateRangeSearchString(effectiveDatePTID, 'month', firstDateOfMonth);
    searchOptions.constraints.push({
      min: 1,
      constraints: [{
        searchTerm,
        fuzzy: false
      }]
    });
    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;
    const enrollmentStatuses :List = fromJS(response.data.hits)
      .filter((enrollmentStatus :Map) => {
        const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
        return ACTIVE_STATUSES.includes(status);
      });
    const enrollmentStatusEKIDs :UUID[] = [];
    enrollmentStatuses.forEach((enrollmentStatus :Map) => enrollmentStatusEKIDs.push(getEntityKeyId(enrollmentStatus)));

    if (enrollmentStatusEKIDs.length) {
      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      let searchFilter :Object = {
        entityKeyIds: enrollmentStatusEKIDs,
        destinationEntitySetIds: [diversionPlanESID],
        sourceEntitySetIds: [diversionPlanESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const diversionPlanNeighbors :Map = fromJS(response.data);
      const diversionPlanEKIDs :UUID[] = [];
      diversionPlanNeighbors.forEach((neighborsList :List) => {
        const diversionPlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
        diversionPlanEKIDs.push(diversionPlanEKID);
      });

      if (diversionPlanEKIDs.length) {
        const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
        searchFilter = {
          entityKeyIds: diversionPlanEKIDs,
          destinationEntitySetIds: [],
          sourceEntitySetIds: [peopleESID],
        };
        response = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
        );
        if (response.error) throw response.error;
        const participantNeighbors :Map = fromJS(response.data)
          .map((neighborsList) => getNeighborDetails(neighborsList.get(0)))
          .valueSeq()
          .toList();
        nonDuplicatedPersonMap = Map().withMutations((map :Map) => {
          participantNeighbors.forEach((person :Map) => {
            const personEKID = getEntityKeyId(person);
            if (!isDefined(map.get(personEKID))) map.set(personEKID, person);
          });
        });
      }
    }

    const {
      ethnicityDemographics,
      raceDemographics,
      sexDemographics,
    } = getDemographicsFromPersonData(nonDuplicatedPersonMap);

    yield put(getMonthlyDemographics.success(id, { ethnicityDemographics, raceDemographics, sexDemographics }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getMonthlyDemographics.failure(id, error));
  }
  finally {
    yield put(getMonthlyDemographics.finally(id));
  }
}

function* getMonthlyDemographicsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MONTHLY_DEMOGRAPHICS, getMonthlyDemographicsWorker);
}

/*
 *
 * DemographicsSagas.getParticipantsDemographics()
 *
 */

function* getParticipantsDemographicsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};

  try {
    yield put(getParticipantsDemographics.request(id));

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :List = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));
    const diversionPlanEKIDs :UUID[] = [];
    diversionPlans.forEach((plan :Map) => diversionPlanEKIDs.push(getEntityKeyId(plan)));

    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const searchFilter = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const participantNeighbors :Map = fromJS(response.data)
      .map((neighborsList) => getNeighborDetails(neighborsList.get(0)))
      .valueSeq()
      .toList();
    const nonDuplicatedPersonMap :Map = Map().withMutations((map :Map) => {
      participantNeighbors.forEach((person :Map) => {
        const personEKID = getEntityKeyId(person);
        if (!isDefined(map.get(personEKID))) map.set(personEKID, person);
      });
    });

    const {
      ethnicityDemographics,
      raceDemographics,
      sexDemographics,
    } = getDemographicsFromPersonData(nonDuplicatedPersonMap);

    yield put(getParticipantsDemographics.success(id, { ethnicityDemographics, raceDemographics, sexDemographics }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getParticipantsDemographics.failure(id, error));
  }
  finally {
    yield put(getParticipantsDemographics.finally(id));
  }
}

function* getParticipantsDemographicsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANTS_DEMOGRAPHICS, getParticipantsDemographicsWorker);
}

export {
  downloadDemographicsDataWatcher,
  downloadDemographicsDataWorker,
  getMonthlyDemographicsWatcher,
  getMonthlyDemographicsWorker,
  getParticipantsDemographicsWatcher,
  getParticipantsDemographicsWorker,
};
