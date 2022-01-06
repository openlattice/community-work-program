// @flow
import FS from 'file-saver';
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
  SearchApiSagas
} from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../../utils/DataUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { DOWNLOAD_ENROLLMENTS, downloadEnrollments } from '../actions';

const { getEntityKeyId } = DataUtils;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPOINTMENT,
  CHECK_INS,
  DIVERSION_PLAN,
  PEOPLE,
  PROGRAM_OUTCOME,
  WORKSITE_PLAN,
  WORKSITE,
} = APP_TYPE_FQNS;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());

const LOG = new Logger('SearchSagas');

function* downloadEnrollmentsWorker(action :SequenceAction) :Saga<*> {
  const { id, value } = action;

  let response :Object = {};

  try {
    yield put(downloadEnrollments.request(id, value));

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;

    // get diversion plans:
    const diversionPlans :Object[] = response.data;
    const diversionPlanEKIDS = diversionPlans.map((diversionPlan) => getEntityKeyId(diversionPlan));

    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const programOutcomeESID :UUID = getEntitySetIdFromApp(app, PROGRAM_OUTCOME);

    // get people, worksite plans, and program outcome neighbors of div plans:
    let filter = {
      entityKeyIds: diversionPlanEKIDS,
      destinationEntitySetIds: [programOutcomeESID],
      sourceEntitySetIds: [peopleESID, worksitePlanESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter })
    );
    if (response.error) throw response.error;

    const personEKIDByDiversionPlanEKID = fromJS(response.data)
      .map((neighborList :List) => {
        const personNeighborList = neighborList.filter((neighbor) => getNeighborESID(neighbor) === peopleESID);
        return getEntityKeyId(getNeighborDetails(personNeighborList.get(0)));
      });

    const worksitePlanNeighborsByDiversionPlanEKID = fromJS(response.data)
      .map((neighborList :List) => neighborList
        .filter((neighbor) => getNeighborESID(neighbor) === worksitePlanESID)
        .map((neighbor) => getNeighborDetails(neighbor)));

    const programOutcomeByDiversionPlanEKID = fromJS(response.data)
      .map((neighborList :List) => {
        const programOutcomeNeighborList = neighborList
          .filter((neighbor) => getNeighborESID(neighbor) === programOutcomeESID);
        return getNeighborDetails(programOutcomeNeighborList.get(0));
      });

    // get worksite and appointment neighbors of worksite plans:
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanEKIDs = [];
    worksitePlanNeighborsByDiversionPlanEKID.forEach((worksitePlanList) => {
      worksitePlanList.forEach((worksitePlan) => worksitePlanEKIDs.push(getEntityKeyId(worksitePlan)));
    });
    filter = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [worksiteESID],
      sourceEntitySetIds: [appointmentESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter })
    );
    if (response.error) throw response.error;

    const worksiteEKIDByWorksitePlanEKID = fromJS(response.data)
      .map((neighborList :List) => {
        const worksiteNeighborList = neighborList.filter((neighbor) => getNeighborESID(neighbor) === worksiteESID);
        return getEntityKeyId(getNeighborDetails(worksiteNeighborList.get(0)));
      });

    const appointmentsByWorksitePlanEKID = fromJS(response.data)
      .map((neighborList :List) => neighborList
        .filter((neighbor) => getNeighborESID(neighbor) === appointmentESID)
        .map((neighbor) => getNeighborDetails(neighbor)));

    // get check in neighbors of appointments:
    const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const appointmentEKIDs = [];
    appointmentsByWorksitePlanEKID.forEach((appointmentList) => {
      appointmentList.forEach((appointment) => appointmentEKIDs.push(getEntityKeyId(appointment)));
    });
    filter = {
      entityKeyIds: appointmentEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [checkInsESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter })
    );
    if (response.error) throw response.error;
    const checkInByAppointmentEKID = fromJS(response.data)
      .map((checkInsList) => getNeighborDetails(checkInsList.get(0)));

    // CREATE JSON DATA:
    const jsData = Map().withMutations((mutator) => {
      fromJS(diversionPlans).forEach((diversionPlan :Map) => {
        const diversionPlanEKID = getEntityKeyId(diversionPlan);

        const diversionPlanObj = Map().withMutations((innerMutator) => {
          diversionPlan.forEach((diversionPlanValueList, diversionPlanProperty) => {

            // diversion plan properties:
            const diversionPlanValue = diversionPlanValueList.get(0);
            if (diversionPlanProperty === ENTITY_KEY_ID) {
              innerMutator.set(`diversion_plan_${ENTITY_KEY_ID}`, diversionPlanValue);
            }
            else {
              innerMutator.set(diversionPlanProperty, diversionPlanValue);
            }

            // personEKID:
            innerMutator.set(`people_${ENTITY_KEY_ID}`, personEKIDByDiversionPlanEKID.get(diversionPlanEKID));

            // worksite plans list (including worksite EKID):
            const worksitePlansList = List().asMutable();
            const worksitePlans = worksitePlanNeighborsByDiversionPlanEKID.get(diversionPlanEKID, List());

            worksitePlans.forEach((worksitePlan :Map) => {
              const worksitePlanEKID = getEntityKeyId(worksitePlan);
              const worksiteEKID = worksiteEKIDByWorksitePlanEKID.get(worksitePlanEKID);

              const worksitePlanObj = Map().withMutations((worksitePlanMutator) => {
                worksitePlan.forEach((worksitePlanValueList, worksitePlanProperty) => {
                  const worksitePlanValue = worksitePlanValueList.get(0);

                  if (worksitePlanProperty === ENTITY_KEY_ID) {
                    worksitePlanMutator.set(`worksite_plan_${ENTITY_KEY_ID}`, worksitePlanValue);
                  }
                  else {
                    worksitePlanMutator.set(worksitePlanProperty, worksitePlanValue);
                  }
                });

                worksitePlanMutator.set(`worksite_${ENTITY_KEY_ID}`, worksiteEKID);
              });
              worksitePlansList.push(worksitePlanObj);
            });

            innerMutator.set('worksitePlans', worksitePlansList);

            // appointments map (worksite plan EKID: [appointments]):
            const appointmentsMap = appointmentsByWorksitePlanEKID
              .map((appointments) => appointments
                .map((appointment) => appointment
                  .map((appointmentValueList) => appointmentValueList.get(0))));
            innerMutator.set('appointments', appointmentsMap);

            // check ins map (appointment EKID: check in):
            const checkInMap = checkInByAppointmentEKID
              .map((checkIn) => checkIn
                .map((checkInValueList) => checkInValueList.get(0)));
            innerMutator.set('checkIns', checkInMap);

            // program outcome:
            const programOutcome = programOutcomeByDiversionPlanEKID.get(diversionPlanEKID, Map());
            const programOutcomeMap = programOutcome.map((programOutcomeValueList) => programOutcomeValueList.get(0));
            if (!programOutcome.isEmpty()) innerMutator.set('programOutcome', programOutcomeMap);

          });
        });

        mutator.set(diversionPlanEKID, diversionPlanObj);

      });
    }).toJS();

    const jsonData = JSON.stringify(jsData);

    const blob = new Blob([jsonData], {
      type: 'application/json'
    });
    FS.saveAs(blob, 'Enrollments'.concat('.json'));

    yield put(downloadEnrollments.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadEnrollments.failure(id, error));
  }
  finally {
    yield put(downloadEnrollments.finally(id));
  }
}

function* downloadEnrollmentsWatcher() :Saga<*> {

  yield takeEvery(DOWNLOAD_ENROLLMENTS, downloadEnrollmentsWorker);
}

export {
  downloadEnrollmentsWatcher,
  downloadEnrollmentsWorker,
};
