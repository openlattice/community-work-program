// @flow
import { Map, fromJS } from 'immutable';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import {
  SEARCH_EXISTING_PEOPLE,
  searchExistingPeople,
} from './NewParticipantActions';
import {
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm,
  getSearchTerm,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { executeSearch } = SearchApiActions;
const { executeSearchWorker } = SearchApiSagas;
const { PEOPLE } = APP_TYPE_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());

const LOG = new Logger('NewParticipantSagas');

/*
 *
 * NewParticipantActions.searchExistingPeople()
 *
 */

function* searchExistingPeopleWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};

  try {
    yield put(searchExistingPeople.request(id, value));

    const {
      dob,
      firstName,
      lastName,
      maxHits,
      start,
    } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const firstNamePTID :UUID = getPropertyTypeIdFromEdm(edm, FIRST_NAME);
    const lastNamePTID :UUID = getPropertyTypeIdFromEdm(edm, LAST_NAME);
    const dobPTID :UUID = getPropertyTypeIdFromEdm(edm, DOB);

    const searchOptions = {
      entitySetIds: [peopleESID],
      start,
      maxHits,
      constraints: []
    };

    if (firstName.length) {
      const firstNameConstraint = getSearchTerm(firstNamePTID, firstName);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: firstNameConstraint,
          fuzzy: true
        }]
      });
    }
    if (lastName.length) {
      const lastNameConstraint = getSearchTerm(lastNamePTID, lastName);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: lastNameConstraint,
          fuzzy: true
        }]
      });
    }
    if (dob.length) {
      const dobConstraint = getSearchTerm(dobPTID, dob);
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm: dobConstraint,
          fuzzy: true
        }]
      });
    }
    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;

    yield put(searchExistingPeople.success(id, fromJS(response.data.hits)));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchExistingPeople.failure(id, error));
  }
  finally {
    yield put(searchExistingPeople.finally(id));
  }
}

function* searchExistingPeopleWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_EXISTING_PEOPLE, searchExistingPeopleWorker);
}

export {
  searchExistingPeopleWatcher,
  searchExistingPeopleWorker,
};
