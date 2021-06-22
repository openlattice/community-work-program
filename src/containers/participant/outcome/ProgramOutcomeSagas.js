// @flow

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
  getIn,
} from 'immutable';
import { Logger } from 'lattice-utils';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { EDIT_PROGRAM_OUTCOME, editProgramOutcome } from './ProgramOutcomeActions';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { selectEntitySetId, selectOrgId } from '../../../core/redux/selectors';
import { submitPartialReplace } from '../../../core/sagas/data/DataActions';
import { submitPartialReplaceWorker } from '../../../core/sagas/data/DataSagas';
import { getPropertyFqnFromEdm } from '../../../utils/DataUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const { ENROLLMENT_STATUS, PROGRAM_OUTCOME } = APP_TYPE_FQNS;

const LOG = new Logger('ProgramOutcomeSagas');

function* editProgramOutcomeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(editProgramOutcome.request(id, value));

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) throw response.error;

    const { enrollmentStatusEKID, entityData, programOutcomeEKID } = value;

    const selectedOrgId = yield select(selectOrgId());
    const enrollmentStatusESID = yield select(selectEntitySetId(selectedOrgId, ENROLLMENT_STATUS));
    const programOutcomeESID = yield select(selectEntitySetId(selectedOrgId, PROGRAM_OUTCOME));

    const enrollmentStatusData = getIn(entityData, [enrollmentStatusESID, enrollmentStatusEKID], Map());
    const programOutcomeData = getIn(entityData, [programOutcomeESID, programOutcomeEKID], Map());

    const edm = yield select((store :Map) => store.get(STATE.EDM));

    const newEnrollmentStatusData :Map = Map().withMutations((mutator) => {
      fromJS(enrollmentStatusData).forEach((entityValue :List, propertyTypeId :UUID) => {
        const propertyFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
        mutator.set(propertyFqn, entityValue);
      });
    });
    const newProgramOutcomeData :Map = Map().withMutations((mutator) => {
      fromJS(programOutcomeData).forEach((entityValue :List, propertyTypeId :UUID) => {
        const propertyFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
        mutator.set(propertyFqn, entityValue);
      });
    });

    yield put(editProgramOutcome.success(id, { newEnrollmentStatusData, newProgramOutcomeData }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editProgramOutcome.failure(id, error));
  }
  finally {
    yield put(editProgramOutcome.finally(id));
  }
}

function* editProgramOutcomeWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PROGRAM_OUTCOME, editProgramOutcomeWorker);
}

export {
  editProgramOutcomeWatcher,
  editProgramOutcomeWorker,
};
