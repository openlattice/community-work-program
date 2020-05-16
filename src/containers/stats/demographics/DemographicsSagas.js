// @flow
import Papa from 'papaparse';
import FS from 'file-saver';
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
import { isDefined } from '../../../utils/LangUtils';
import {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getParticipantsDemographics,
} from './DemographicsActions';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ETHNICITY_VALUES, RACE_VALUES, SEX_VALUES } from '../../../core/edm/constants/DataModelConsts';
import { ETHNICITY_ALIASES, RACE_ALIASES } from '../consts/StatsConsts';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { DIVERSION_PLAN, PEOPLE } = APP_TYPE_FQNS;
const { ETHNICITY, RACE, SEX } = PROPERTY_TYPE_FQNS;
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
  let raceDemographics :Map = Map().withMutations((map :Map) => {
    RACE_VALUES.forEach((race :string) => map.set(race, 0));
  });
  let ethnicityDemographics :Map = Map().withMutations((map :Map) => {
    ETHNICITY_VALUES.concat([RACE_VALUES[5], RACE_VALUES[6]]).forEach((ethnicity :string) => map.set(ethnicity, 0));
  });
  let sexDemographics :Map = Map().withMutations((map :Map) => {
    SEX_VALUES.forEach((sex :string) => map.set(sex, 0));
  });

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

    nonDuplicatedPersonMap.forEach((person :Map) => {

      const { [ETHNICITY]: ethnicity, [RACE]: race, [SEX]: sex } = getEntityProperties(person, [ETHNICITY, RACE, SEX]);

      const currentTotalForRace :any = raceDemographics.get(race);
      if (race.length && isDefined(currentTotalForRace)) {
        raceDemographics = raceDemographics.set(race, currentTotalForRace + 1);
      }
      else if (race.length && !isDefined(currentTotalForRace)) {
        let alternateFound :boolean = false;
        fromJS(RACE_ALIASES).forEach((listOfAlternates :List, standardName :string) => {
          listOfAlternates.forEach((alternate :string) => {
            if (race === alternate.trim()) {
              const currentTotal :number = raceDemographics.get(standardName, 0);
              raceDemographics = raceDemographics.set(standardName, currentTotal + 1);
              alternateFound = true;
            }
          });
        });
        if (!alternateFound) {
          const otherNotSpecifiedTotal = raceDemographics.get(RACE_VALUES[5], 0);
          raceDemographics = raceDemographics.set(RACE_VALUES[5], otherNotSpecifiedTotal + 1);
        }
      }
      else if (!race.length) {
        const unknownTotal = raceDemographics.get(RACE_VALUES[6], 0);
        raceDemographics = raceDemographics.set(RACE_VALUES[6], unknownTotal + 1);
      }

      const currentTotalForEthnicity = ethnicityDemographics.get(ethnicity);
      if (ethnicity.length && isDefined(currentTotalForEthnicity)) {
        ethnicityDemographics = ethnicityDemographics.set(ethnicity, currentTotalForEthnicity + 1);
      }
      else if (ethnicity.length && !isDefined(currentTotalForEthnicity)) {
        let aliasFound :boolean = false;
        fromJS(ETHNICITY_ALIASES).forEach((ethnicityAliases :List, standardName :string) => {
          ethnicityAliases.forEach((alias :string) => {
            if (alias === ethnicity.trim()) {
              const currentTotal :number = ethnicityDemographics.get(standardName, 0);
              ethnicityDemographics = ethnicityDemographics.set(standardName, currentTotal + 1);
              aliasFound = true;
            }
          });
        });
        if (!aliasFound) {
          const otherNotSpecifiedTotal = ethnicityDemographics.get(RACE_VALUES[5], 0);
          ethnicityDemographics = ethnicityDemographics.set(RACE_VALUES[5], otherNotSpecifiedTotal + 1);
        }
      }
      else if (!ethnicity.length) {
        const unknownTotal = ethnicityDemographics.get(RACE_VALUES[6], 0);
        ethnicityDemographics = ethnicityDemographics.set(RACE_VALUES[6], unknownTotal + 1);
      }

      const currentTotalForSex :any = sexDemographics.get(sex);
      if (sex.length && isDefined(currentTotalForSex)) {
        sexDemographics = sexDemographics.set(sex, currentTotalForSex + 1);
      }
      else if (sex.length && !isDefined(currentTotalForSex)) {
        if (sex.trim() === 'M') {
          const currentTotalForMale :any = sexDemographics.get(SEX_VALUES[1]);
          sexDemographics = sexDemographics.set(SEX_VALUES[1], currentTotalForMale + 1);
        }
        if (sex.trim() === 'F') {
          const currentTotalForFemale :any = sexDemographics.get(SEX_VALUES[0]);
          sexDemographics = sexDemographics.set(SEX_VALUES[0], currentTotalForFemale + 1);
        }
      }
      else if (!sex.length) {
        const unknownTotal = sexDemographics.get(SEX_VALUES[2], 0);
        sexDemographics = sexDemographics.set(SEX_VALUES[2], unknownTotal + 1);
      }
    });

    raceDemographics = raceDemographics.asImmutable();
    ethnicityDemographics = ethnicityDemographics.asImmutable();
    sexDemographics = sexDemographics.asImmutable();
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
