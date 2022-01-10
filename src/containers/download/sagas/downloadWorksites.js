// @flow
import FS from 'file-saver';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { DOWNLOAD_WORKSITES, downloadWorksites } from '../actions';

const { getEntityKeyId } = DataUtils;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { WORKSITE } = APP_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());

const LOG = new Logger('SearchSagas');

function* downloadWorksitesWorker(action :SequenceAction) :Saga<*> {
  const { id, value } = action;

  let response :Object = {};

  try {
    yield put(downloadWorksites.request(id, value));

    const app = yield select(getAppFromState);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: worksiteESID }));
    if (response.error) throw response.error;

    const worksites :Object[] = response.data;

    // CREATE JSON DATA:
    const jsData = Map().withMutations((mutator) => {
      fromJS(worksites).forEach((worksite :Map) => {
        const worksiteEKID = getEntityKeyId(worksite);

        const worksiteObj = Map().withMutations((innerMutator) => {
          worksite.forEach((valueList, property) => {
            innerMutator.set(property, valueList.get(0));
          });

        });
        mutator.set(worksiteEKID, worksiteObj);
      });
    }).toJS();

    const jsonData = JSON.stringify(jsData);

    const blob = new Blob([jsonData], {
      type: 'application/json'
    });
    FS.saveAs(blob, 'Worksites'.concat('.json'));

    yield put(downloadWorksites.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadWorksites.failure(id, error));
  }
  finally {
    yield put(downloadWorksites.finally(id));
  }
}

function* downloadWorksitesWatcher() :Saga<*> {

  yield takeEvery(DOWNLOAD_WORKSITES, downloadWorksitesWorker);
}

export {
  downloadWorksitesWatcher,
  downloadWorksitesWorker,
};
