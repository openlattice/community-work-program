// @flow
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';

import {
  ADD_WORKSITE_PLAN,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  EDIT_WORKSITE_PLAN,
  GET_APPOINTMENT_CHECK_INS,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  UPDATE_HOURS_WORKED,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  editWorksitePlan,
  getAppointmentCheckIns,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  updateHoursWorked,
} from './WorksitePlanActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getPropertyTypeIdFromEdm,
  sortEntitiesByDateProperty,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { deleteEntities, submitDataGraph, submitPartialReplace } from '../../../core/sagas/data/DataActions';
import {
  deleteEntitiesWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker
} from '../../../core/sagas/data/DataSagas';
import { STATE, WORKSITES } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ADDRESSES,
  APPOINTMENT,
  BASED_ON,
  CHECK_INS,
  CHECK_IN_DETAILS,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  FULFILLS,
  WORKSITE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, HOURS_WORKED } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const getWorksitesListFromState = (state) => state.getIn([STATE.WORKSITES, WORKSITES.WORKSITES_LIST], List());

const LOG = new Logger('WorksitePlanSagas');

/*
 *
 * WorksitePlanActions.addWorksitePlan()
 *
 */

function* addWorksitePlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addWorksitePlan.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const worksitePlanESID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const worksitePlanEKID = entityKeyIds[worksitePlanESID][0];
    const worksitePlanStatusEKID = entityKeyIds[enrollmentStatusESID][0];
    const basedOnESID = getEntitySetIdFromApp(app, BASED_ON);
    const worksitesList = yield select(getWorksitesListFromState);

    yield put(addWorksitePlan.success(id, {
      basedOnESID,
      edm,
      enrollmentStatusESID,
      worksitePlanEKID,
      worksitePlanESID,
      worksitePlanStatusEKID,
      worksitesList,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addWorksitePlanWorker()', error);
    yield put(addWorksitePlan.failure(id, error));
  }
  finally {
    yield put(addWorksitePlan.finally(id));
  }
}

function* addWorksitePlanWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_WORKSITE_PLAN, addWorksitePlanWorker);
}

/*
 *
 * WorksitePlanActions.createWorkAppointments()
 *
 */

function* createWorkAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(createWorkAppointments.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const addressesESID :UUID = getEntitySetIdFromApp(app, ADDRESSES);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const appointmentEKIDs :UUID[] = entityKeyIds[appointmentESID];
    const edm = yield select(getEdmFromState);

    yield put(createWorkAppointments.success(id, {
      addressesESID,
      appointmentEKIDs,
      appointmentESID,
      edm,
    }));
  }
  catch (error) {
    LOG.error('caught exception in createWorkAppointmentsWorker()', error);
    yield put(createWorkAppointments.failure(id, error));
  }
  finally {
    yield put(createWorkAppointments.finally(id));
  }
}

function* createWorkAppointmentsWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_WORK_APPOINTMENTS, createWorkAppointmentsWorker);
}

/*
 *
 * WorksitePlanActions.deleteAppointment()
 *
 */

function* deleteAppointmentWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(deleteAppointment.request(id, value));

    const response :Object = yield call(deleteEntitiesWorker, deleteEntities(value));
    if (response.error) {
      throw response.error;
    }

    yield put(deleteAppointment.success(id));
  }
  catch (error) {
    LOG.error('caught exception in deleteAppointmentWorker()', error);
    yield put(deleteAppointment.failure(id, error));
  }
  finally {
    yield put(deleteAppointment.finally(id));
  }
}

function* deleteAppointmentWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_APPOINTMENT, deleteAppointmentWorker);
}

/*
 *
 * WorksitePlanActions.editAppointment()
 *
 */

function* editAppointmentWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(editAppointment.request(id, value));

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const edm = yield select(getEdmFromState);

    yield put(editAppointment.success(id, {
      appointmentESID,
      edm,
    }));
  }
  catch (error) {
    LOG.error('caught exception in editAppointmentWorker()', error);
    yield put(editAppointment.failure(id, error));
  }
  finally {
    yield put(editAppointment.finally(id));
  }
}

function* editAppointmentWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_APPOINTMENT, editAppointmentWorker);
}

/*
 *
 * WorksitePlanActions.editWorksitePlan()
 *
 */

function* editWorksitePlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let worksitePlanStatusEKID :string[] = [''];

  try {
    yield put(editWorksitePlan.request(id, value));

    const {
      statusEntityData,
      statusAssociationData,
      worksitePlanEKID,
      worksitePlanDataToEdit
    } = value;

    if (Object.keys(statusEntityData).length) {

      response = yield call(submitDataGraphWorker, submitDataGraph({
        entityData: statusEntityData,
        associationEntityData: statusAssociationData
      }));
      if (response.error) {
        throw response.error;
      }
      const { data } :Object = response;
      const { entityKeyIds } :Object = data;
      // $FlowFixMe
      [worksitePlanStatusEKID] = Object.values(entityKeyIds);
    }

    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    if (Object.keys(worksitePlanDataToEdit[worksitePlanESID][worksitePlanEKID]).length) {

      response = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData: worksitePlanDataToEdit }));
      if (response.error) {
        throw response.error;
      }
    }

    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const edm = yield select(getEdmFromState);

    yield put(editWorksitePlan.success(id, {
      edm,
      enrollmentStatusESID,
      worksitePlanEKID,
      worksitePlanESID,
      worksitePlanStatusEKID,
    }));
  }
  catch (error) {
    LOG.error('caught exception in editWorksitePlanWorker()', error);
    yield put(editWorksitePlan.failure(id, error));
  }
  finally {
    yield put(editWorksitePlan.finally(id));
  }
}

function* editWorksitePlanWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_WORKSITE_PLAN, editWorksitePlanWorker);
}


/*
 *
 * WorksitePlanActions.getAppointmentCheckIns()
 *
 */

function* getAppointmentCheckInsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let checkInData :Map = Map();
  let checkInsByAppointment :Map = Map();

  try {
    yield put(getAppointmentCheckIns.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { workAppointmentEKIDs } = value;
    const app = yield select(getAppFromState);

    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const checkInESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);

    let searchFilter :Object = {
      entityKeyIds: workAppointmentEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [checkInESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (Object.keys(response.data).length > 0) {
      checkInData = fromJS(response.data)
        .map((appointmentCheckIns :List) => appointmentCheckIns
          .map((checkIn :Map) => getNeighborDetails(checkIn)));

      const checkInEKIDs :UUID[] = [];
      checkInData
        .forEach((checkIns :List) => {
          checkIns.forEach((checkIn :Map) => {
            const checkInEKID :UUID = getEntityKeyId(checkIn);
            checkInEKIDs.push(checkInEKID);
          });
        });
      const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
      searchFilter = {
        entityKeyIds: checkInEKIDs,
        destinationEntitySetIds: [checkInDetailsESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: checkInESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const checkInDetailsByCheckIn :Map = fromJS(response.data)
        .map((checkInDetailsList :List) => checkInDetailsList.map((details :Map) => getNeighborDetails(details)));

      /* Store hours worked property from check-in details on check-in to save additional lookups */
      checkInData
        .forEach((checkInEntity :List, appointmentEKID :UUID) => {
          const checkInEKID :UUID = getEntityKeyId(checkInEntity.get(0));
          const checkInDetails = checkInDetailsByCheckIn.getIn([checkInEKID, 0]);

          let checkIn :Map = checkInEntity.get(0);
          if (isDefined(checkInDetails)) {
            const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkInDetails, [HOURS_WORKED]);
            checkIn = checkIn.set(HOURS_WORKED, [hoursWorked]);
          }
          checkInsByAppointment = checkInsByAppointment.set(appointmentEKID, checkIn);
        });
    }

    yield put(getAppointmentCheckIns.success(id, checkInsByAppointment));
  }
  catch (error) {
    LOG.error('caught exception in getAppointmentCheckInsWorker()', error);
    yield put(getAppointmentCheckIns.failure(id, error));
  }
  finally {
    yield put(getAppointmentCheckIns.finally(id));
  }
}

function* getAppointmentCheckInsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_APPOINTMENT_CHECK_INS, getAppointmentCheckInsWorker);
}


/*
 *
 * WorksitePlanActions.getWorkAppointments()
 *
 */

function* getWorkAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let workAppointmentsByWorksitePlan :Map = Map();

  try {
    yield put(getWorkAppointments.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { worksitePlans } = value;
    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanEKIDs :string[] = [];
    worksitePlans.forEach((worksitePlan :Map) => {
      worksitePlanEKIDs.push(getEntityKeyId(worksitePlan));
    });

    const searchFilter :Object = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [appointmentESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (Object.keys(response.data).length > 0) {
      workAppointmentsByWorksitePlan = fromJS(response.data)
        .map((appointmentsList :List) => appointmentsList.map((appt :Map) => getNeighborDetails(appt)));

      const workAppointmentEKIDs :UUID[] = [];
      workAppointmentsByWorksitePlan
        .forEach((appointmentsList :List) => {
          appointmentsList.forEach((appt :Map) => {
            const appointmentEKID :UUID = getEntityKeyId(appt);
            workAppointmentEKIDs.push(appointmentEKID);
          });
        });
      yield call(getAppointmentCheckInsWorker, getAppointmentCheckIns({ workAppointmentEKIDs }));
    }

    yield put(getWorkAppointments.success(id, workAppointmentsByWorksitePlan));
  }
  catch (error) {
    LOG.error('caught exception in getWorkAppointmentsWorker()', error);
    yield put(getWorkAppointments.failure(id, error));
  }
  finally {
    yield put(getWorkAppointments.finally(id));
  }
}

function* getWorkAppointmentsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORK_APPOINTMENTS, getWorkAppointmentsWorker);
}

/*
 *
 * WorksitePlanActions.getWorksiteByWorksitePlan()
 *
 */

function* getWorksiteByWorksitePlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitesByPlanEKID :Map = Map();

  try {
    yield put(getWorksiteByWorksitePlan.request(id));
    const { worksitePlans } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const worksitePlanEKIDs :UUID[] = [];
    worksitePlans.forEach((plan :Map) => worksitePlanEKIDs.push(getEntityKeyId(plan)));

    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);

    const searchFilter :Object = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [worksiteESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (Object.keys(response.data).length > 0) {

      worksitesByPlanEKID = fromJS(response.data)
        .map((worksitesList :List) => getNeighborDetails(worksitesList.get(0)));
    }

    yield put(getWorksiteByWorksitePlan.success(id, worksitesByPlanEKID));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getWorksiteByWorksitePlanWorker()', error);
    yield put(getWorksiteByWorksitePlan.failure(id, error));
  }
  finally {
    yield put(getWorksiteByWorksitePlan.finally(id));
  }
  return workerResponse;
}

function* getWorksiteByWorksitePlanWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_BY_WORKSITE_PLAN, getWorksiteByWorksitePlanWorker);
}

/*
 *
 * WorksitePlanActions.getWorksitePlanStatuses()
 *
 */

function* getWorksitePlanStatusesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let worksitePlanStatuses :List = List();

  try {
    yield put(getWorksitePlanStatuses.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { worksitePlans } = value;
    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const worksitePlanEKIDs :string[] = [];
    worksitePlans.forEach((worksitePlan :Map) => {
      worksitePlanEKIDs.push(getEntityKeyId(worksitePlan));
    });

    const params :Object = {
      entitySetId: worksitePlanESID,
      filter: {
        entityKeyIds: worksitePlanEKIDs,
        destinationEntitySetIds: [enrollmentStatusESID],
        sourceEntitySetIds: [],
      }
    };
    response = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter(params));
    if (response.error) {
      throw response.error;
    }
    worksitePlanStatuses = fromJS(response.data);

    if (!worksitePlanStatuses.isEmpty()) {
      worksitePlanStatuses = worksitePlanStatuses
        .map((statusList :List) => statusList
          .map((status :Map) => getNeighborDetails(status)));

      // get most recent status for each work site plan:
      worksitePlanStatuses = worksitePlanStatuses
        .map((statusList :List) => {
          const sortedStatusList :List = sortEntitiesByDateProperty(statusList, [EFFECTIVE_DATE]);
          return sortedStatusList.last();
        });
    }

    yield put(getWorksitePlanStatuses.success(id, worksitePlanStatuses));
  }
  catch (error) {
    LOG.error('caught exception in getWorksitePlanStatusesWorker()', error);
    yield put(getWorksitePlanStatuses.failure(id, error));
  }
  finally {
    yield put(getWorksitePlanStatuses.finally(id));
  }
}

function* getWorksitePlanStatusesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_PLAN_STATUSES, getWorksitePlanStatusesWorker);
}

/*
 *
 * WorksitePlanActions.getWorksitePlans()
 *
 */

function* getWorksitePlansWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitePlans :List = List();

  try {
    yield put(getWorksitePlans.request(id));
    const { diversionPlan } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);

    const searchFilter :Object = {
      entityKeyIds: [diversionPlanEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [worksitePlanESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[diversionPlanEKID]) {
      worksitePlans = fromJS(response.data[diversionPlanEKID])
        .map((worksitePlan :Map) => getNeighborDetails(worksitePlan));

      yield all([
        call(getWorksiteByWorksitePlanWorker, getWorksiteByWorksitePlan({ worksitePlans })),
        call(getWorkAppointmentsWorker, getWorkAppointments({ worksitePlans })),
        call(getWorksitePlanStatusesWorker, getWorksitePlanStatuses({ worksitePlans })),
      ]);
    }

    yield put(getWorksitePlans.success(id, worksitePlans));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getWorksitePlansWorker()', error);
    yield put(getWorksitePlans.failure(id, error));
  }
  finally {
    yield put(getWorksitePlans.finally(id));
  }
  return workerResponse;
}

function* getWorksitePlansWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_PLANS, getWorksitePlansWorker);
}

/*
 *
 * WorksitePlanActions.updateHoursWorked()
 *
 */

function* updateHoursWorkedWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let newWorksitePlan :Map = Map();

  try {
    yield put(updateHoursWorked.request(id, value));

    const { appointmentEKID, numberHoursWorked } = value;

    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    const searchFilter :{} = {
      entityKeyIds: [appointmentEKID],
      destinationEntitySetIds: [worksitePlanESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[appointmentEKID]) {

      const worksitePlan :Map = getNeighborDetails(fromJS(response.data[appointmentEKID][0]));
      const edm = yield select(getEdmFromState);
      const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
      const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
      const { [HOURS_WORKED]: hoursWorkedOld } = getEntityProperties(worksitePlan, [HOURS_WORKED]);
      const hoursWorkedToDate = hoursWorkedOld + numberHoursWorked;
      const worksitePlanDataToUpdate :{} = {
        [worksitePlanEKID]: {
          [hoursWorkedPTID]: [hoursWorkedToDate]
        }
      };
      const entityData :{} = {
        [worksitePlanESID]: worksitePlanDataToUpdate
      };

      response = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
      if (response.error) {
        throw response.error;
      }

      newWorksitePlan = worksitePlan;
      newWorksitePlan = newWorksitePlan.setIn([HOURS_WORKED, 0], hoursWorkedToDate);
    }

    yield put(updateHoursWorked.success(id, newWorksitePlan));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in updateHoursWorkedWorker()', error);
    yield put(updateHoursWorked.failure(id, error));
  }
  finally {
    yield put(updateHoursWorked.finally(id));
  }
  return workerResponse;
}

function* updateHoursWorkedWatcher() :Generator<*, *, *> {

  yield takeEvery(UPDATE_HOURS_WORKED, updateHoursWorkedWorker);
}

/*
 *
 * WorksitePlanActions.checkInForAppointment()
 *
 */

function* checkInForAppointmentWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(checkInForAppointment.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } = response;
    const { entityKeyIds } = data;
    const app = yield select(getAppFromState);
    const checkInESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const checkInEKID :UUID = entityKeyIds[checkInESID][0];

    if (response.data) {

      const edm = yield select(getEdmFromState);
      const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
      const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
      const { entityData } = value;
      const numberHoursWorked :number = entityData[checkInDetailsESID][0][hoursWorkedPTID][0];

      const { associationEntityData } = value;
      const fulfillsESID :UUID = getEntitySetIdFromApp(app, FULFILLS);
      const appointmentEKID :UUID = associationEntityData[fulfillsESID][0].dstEntityKeyId;

      response = yield call(updateHoursWorkedWorker, updateHoursWorked({ appointmentEKID, numberHoursWorked }));
      if (response.error) {
        throw response.error;
      }

      response = {
        appointmentEKID,
        checkInDetailsESID,
        checkInEKID,
        checkInESID,
        edm,
      };
    }

    yield put(checkInForAppointment.success(id, response));
  }
  catch (error) {
    LOG.error('caught exception in checkInForAppointmentWorker()', error);
    yield put(checkInForAppointment.failure(id, error));
  }
  finally {
    yield put(checkInForAppointment.finally(id));
  }
}

function* checkInForAppointmentWatcher() :Generator<*, *, *> {

  yield takeEvery(CHECK_IN_FOR_APPOINTMENT, checkInForAppointmentWorker);
}

export {
  addWorksitePlanWatcher,
  addWorksitePlanWorker,
  checkInForAppointmentWatcher,
  checkInForAppointmentWorker,
  createWorkAppointmentsWatcher,
  createWorkAppointmentsWorker,
  deleteAppointmentWatcher,
  deleteAppointmentWorker,
  editAppointmentWatcher,
  editAppointmentWorker,
  editWorksitePlanWatcher,
  editWorksitePlanWorker,
  getAppointmentCheckInsWatcher,
  getAppointmentCheckInsWorker,
  getWorkAppointmentsWatcher,
  getWorkAppointmentsWorker,
  getWorksiteByWorksitePlanWatcher,
  getWorksiteByWorksitePlanWorker,
  getWorksitePlanStatusesWatcher,
  getWorksitePlanStatusesWorker,
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
  updateHoursWorkedWatcher,
  updateHoursWorkedWorker,
};
