/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { APP_TYPE_FQNS, INCIDENT_START_DATETIME } from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  FIND_APPOINTMENTS,
  findAppointments,
} from './WorkScheduleActions';
import {
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm,
  getSearchTerm,
  getUTCDateRangeSearchString
} from '../../utils/DataUtils';
import { timePeriods } from './WorkScheduleConstants';

const LOG = new Logger('WorkScheduleSagas');
const { executeSearch } = SearchApiActions;
const { executeSearchWorker } = SearchApiSagas;

const { APPOINTMENT } = APP_TYPE_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());

/*
appointment -> addresses -> work site plan -> based on -> work site
work site plan -> related to -> enrollment status
*/

/*
 *
 * WorkScheduleActions.findAppointments()
 *
 */

function* findAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let appointments :List = List();

  try {
    yield put(findAppointments.request(id, value));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { selectedDate, timePeriod } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const startDatetimePTID :UUID = getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME);

    const searchOptions = {
      entitySetIds: [appointmentESID],
      start: 0,
      maxHits: 10000,
      constraints: [{
        min: 1,
        constraints: []
      }]
    };
    let searchTerm :string = '';

    if (timePeriod === timePeriods.DAY) {
      searchTerm = getSearchTerm(startDatetimePTID, selectedDate);
      searchOptions.constraints[0].constraints.push({
        searchTerm,
        fuzzy: false
      });
    }
    if (timePeriod === timePeriods.WEEK || timePeriod === timePeriods.MONTH) {
      const selectedDateAsDateTime :DateTime = DateTime.fromISO(selectedDate);
      searchTerm = getUTCDateRangeSearchString(startDatetimePTID, timePeriod, selectedDateAsDateTime);
      searchOptions.constraints[0].constraints.push({
        searchTerm,
        fuzzy: false
      });
    }

    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    appointments = fromJS(response.data.hits);

    yield put(findAppointments.success(id, appointments));
  }
  catch (error) {
    LOG.error('caught exception in findAppointmentsWorker()', error);
    yield put(findAppointments.failure(id, error));
  }
  finally {
    yield put(findAppointments.finally(id));
  }
}

function* findAppointmentsWatcher() :Generator<*, *, *> {

  yield takeEvery(FIND_APPOINTMENTS, findAppointmentsWorker);
}

export {
  findAppointmentsWatcher,
  findAppointmentsWorker,
};
