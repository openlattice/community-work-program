/*
 * @flow
 */

import FS from 'file-saver';
import Papa from 'papaparse';
import {
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
import { DataUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getParticipantsDemographics,
} from './DemographicsActions';

import Logger from '../../../utils/Logger';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityKeyId,
  getEntitySetIdFromApp,
  getNeighborDetails,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined } from '../../../utils/LangUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { ALL_TIME } from '../consts/TimeConsts';
import { getDemographicsFromPersonData } from '../utils/DemographicsUtils';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getPropertyValue } = DataUtils;

const { DIVERSION_PLAN, PEOPLE } = APP_TYPE_FQNS;
const {
  CHECKIN_DATETIME,
  DATETIME_RECEIVED,
  ORIENTATION_DATETIME,
} = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());

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
 * DemographicsSagas.getParticipantsDemographics()
 *
 */

function* getParticipantsDemographicsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  let nonDuplicatedPersonMap :Map = Map();
  let ethnicityDemographics :Map = Map();
  let raceDemographics :Map = Map();
  let sexDemographics :Map = Map();

  try {
    yield put(getParticipantsDemographics.request(id));
    const { value } = action;

    const { month, timeFrame, year } = value;

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    if (timeFrame === ALL_TIME || !timeFrame) {
      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
      if (response.error) throw response.error;
      const diversionPlans :List = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));
      const diversionPlanEKIDs :UUID[] = diversionPlans.map((plan :Map) => getEntityKeyId(plan)).toJS();

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
      nonDuplicatedPersonMap = Map().withMutations((map :Map) => {
        participantNeighbors.forEach((person :Map) => {
          const personEKID = getEntityKeyId(person);
          if (!isDefined(map.get(personEKID))) map.set(personEKID, person);
        });
      });

      const {
        ethnicityDemographicsData,
        raceDemographicsData,
        sexDemographicsData,
      } = getDemographicsFromPersonData(nonDuplicatedPersonMap);

      ethnicityDemographics = ethnicityDemographicsData;
      raceDemographics = raceDemographicsData;
      sexDemographics = sexDemographicsData;
    }
    else {
      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
      if (response.error) throw response.error;

      const diversionPlans :List = fromJS(response.data);

      const diversionPlansBeginningSelectedMonth = List().withMutations((mutator) => {
        diversionPlans.forEach((diversionPlan :Map) => {
          const sentenceDateTime = getPropertyValue(diversionPlan, [DATETIME_RECEIVED, 0]);
          const checkInDateTime = getPropertyValue(diversionPlan, [CHECKIN_DATETIME, 0]);
          const orientationDateTime = getPropertyValue(diversionPlan, [ORIENTATION_DATETIME, 0]);

          if (isDefined(sentenceDateTime)) {
            const sentenceDateTimeObj = DateTime.fromISO(sentenceDateTime);
            const sentenceDateMonth = sentenceDateTimeObj.month;
            const sentenceDateYear = sentenceDateTimeObj.year;
            if (sentenceDateMonth === month && sentenceDateYear === year) {
              mutator.push(diversionPlan);
            }
          }
          else if (isDefined(checkInDateTime)) {
            const checkInDateTimeObj = DateTime.fromISO(checkInDateTime);
            const checkInDateMonth = checkInDateTimeObj.month;
            const checkInDateYear = checkInDateTimeObj.year;
            if (checkInDateMonth === month && checkInDateYear === year) {
              mutator.push(diversionPlan);
            }
          }
          else if (isDefined(orientationDateTime)) {
            const orientationDateTimeObj = DateTime.fromISO(orientationDateTime);
            const orientationDateMonth = orientationDateTimeObj.month;
            const orientationDateYear = orientationDateTimeObj.year;
            if (orientationDateMonth === month && orientationDateYear === year) {
              mutator.push(diversionPlan);
            }
          }
        });
      });

      const diversionPlanEKIDs :UUID[] = diversionPlansBeginningSelectedMonth
        .map((diversionPlan :Map) => getEntityKeyId(diversionPlan))
        .toJS();

      if (diversionPlanEKIDs.length) {
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
        nonDuplicatedPersonMap = Map().withMutations((map :Map) => {
          participantNeighbors.forEach((person :Map) => {
            const personEKID = getEntityKeyId(person);
            if (!isDefined(map.get(personEKID))) map.set(personEKID, person);
          });
        });
      }

      const {
        ethnicityDemographicsData,
        raceDemographicsData,
        sexDemographicsData,
      } = getDemographicsFromPersonData(nonDuplicatedPersonMap);

      ethnicityDemographics = ethnicityDemographicsData;
      raceDemographics = raceDemographicsData;
      sexDemographics = sexDemographicsData;
    }

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
  getParticipantsDemographicsWatcher,
  getParticipantsDemographicsWorker,
};
