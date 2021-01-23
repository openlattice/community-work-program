// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { LangUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm,
  getSearchTerm,
} from '../../../utils/DataUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { SEARCH_PARTICIPANTS, searchParticipants } from '../actions';

const { isNonEmptyString } = LangUtils;
const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { PEOPLE } = APP_TYPE_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());

const LOG = new Logger('SearchSagas');

function* searchParticipantsWorker(action :SequenceAction) :Saga<*> {
  const { id, value } = action;

  let searchedParticipants :List = List();
  let totalHits :number = 0;
  let response :Object = {};

  try {
    yield put(searchParticipants.request(id, value));
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

    if (firstName === '*' && lastName === '*') {
      searchOptions.constraints.push({
        constraints: [{
          type: 'advanced',
          searchFields: [
            { searchTerm: '*', property: firstNamePTID },
            { searchTerm: '*', property: lastNamePTID }
          ],
        }]
      });
      response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
      if (response.error) throw response.error;
      searchedParticipants = fromJS(response.data.hits);
      totalHits = response.data.numHits;
    }
    else {
      if (isNonEmptyString(firstName)) {
        const firstNameConstraint = getSearchTerm(firstNamePTID, firstName);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: firstNameConstraint,
            fuzzy: true
          }]
        });
      }
      if (isNonEmptyString(lastName)) {
        const lastNameConstraint = getSearchTerm(lastNamePTID, lastName);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: lastNameConstraint,
            fuzzy: true
          }]
        });
      }
      if (DateTime.fromISO(dob).isValid) {
        const dobConstraint = getSearchTerm(dobPTID, dob);
        searchOptions.constraints.push({
          min: 1,
          constraints: [{
            searchTerm: dobConstraint,
            fuzzy: true
          }]
        });
      }

      response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
      if (response.error) throw response.error;
      searchedParticipants = fromJS(response.data.hits);
      totalHits = response.data.numHits;
    }

    yield put(searchParticipants.success(id, { searchedParticipants, totalHits }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchParticipants.failure(id, error));
  }
  finally {
    yield put(searchParticipants.finally(id));
  }
}

function* searchParticipantsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_PARTICIPANTS, searchParticipantsWorker);
}

export {
  searchParticipantsWatcher,
  searchParticipantsWorker,
};
