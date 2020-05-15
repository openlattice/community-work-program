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
import { isDefined } from '../../../utils/LangUtils';
import {
  GET_PARTICIPANTS_DEMOGRAPHICS,
  getParticipantsDemographics,
} from './DemographicsActions';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ETHNICITY_VALUES, RACE_VALUES } from '../../../core/edm/constants/DataModelConsts';
import { ETHNICITY_ALIASES, RACE_ALIASES } from '../consts/StatsConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { DIVERSION_PLAN, PEOPLE } = APP_TYPE_FQNS;
const { ETHNICITY, RACE } = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());
const LOG = new Logger('DemographicsSagas');

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
    const participantNeighbors :Map = fromJS(response.data);

    participantNeighbors.forEach((neighborsList :List) => {

      const person :Map = getNeighborDetails(neighborsList.get(0));
      const { [ETHNICITY]: ethnicity, [RACE]: race } = getEntityProperties(person, [ETHNICITY, RACE]);

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
    });

    raceDemographics = raceDemographics.asImmutable();
    ethnicityDemographics = ethnicityDemographics.asImmutable();
    yield put(getParticipantsDemographics.success(id, { ethnicityDemographics, raceDemographics }));
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
  getParticipantsDemographicsWatcher,
  getParticipantsDemographicsWorker,
};
