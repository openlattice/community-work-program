// @flow
import {
  fromJS,
  Map,
} from 'immutable';
import {
  put,
  takeEvery
} from '@redux-saga/core/effects';
import moment from 'moment';

import Logger from '../../utils/Logger';

import {
  GET_WARNINGS_VIOLATIONS_NOTE,
  GET_WARNINGS_VIOLATIONS_LIST,
  getWarningsViolationsNote,
  getWarningsViolationsList,
} from './ParticipantActions';
import {
  ERR_ACTION_VALUE_NOT_DEFINED, ERR_ACTION_VALUE_TYPE,
} from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';

const LOG = new Logger('ParticipantSagas');

export function* getWarningsViolationsListWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    yield put(getWarningsViolationsList.request(action.id));

    const { violations } = value;
    const warningsViolationsList = violations
      .sortBy(
        violations.get('datetime'),
        (timeA, timeB) => {
          const dateTimeA = moment(timeA);
          const dateTimeB = moment(timeB);
          return dateTimeB.diff(dateTimeA);
        }
      )
      .map((notesDetails :Map) => {
        const noteValue = notesDetails.get('id');
        /* eslint-disable max-len */
        const label = `${notesDetails.get('worksite')} — ${notesDetails.get('datetime').split('T')[0]}`;
        return Map({
          data: notesDetails,
          value: noteValue,
          label,
        });
      });
    yield put(getWarningsViolationsList.success(action.id, warningsViolationsList));
  }
  catch (error) {
    LOG.error(error);
    yield put(getWarningsViolationsList.failure(action.id, error));
  }
  finally {
    yield put(getWarningsViolationsList.finally(action.id));
  }
}

export function* getWarningsViolationsListWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_WARNINGS_VIOLATIONS_LIST, getWarningsViolationsListWorker);
}

export function* getWarningsViolationsNoteWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { value } = action;
    if (value === null || value === undefined) throw ERR_ACTION_VALUE_NOT_DEFINED;
    if (typeof value !== 'object') throw ERR_ACTION_VALUE_TYPE;

    const warningOrViolation = fromJS(value).get('data');
    yield put(getWarningsViolationsNote.success(action.id, { data: warningOrViolation }));
  }
  catch (error) {
    LOG.error(error);
    yield put(getWarningsViolationsNote.failure(action.id, error));
  }
  finally {
    yield put(getWarningsViolationsNote.finally(action.id));
  }
}

export function* getWarningsViolationsNoteWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_WARNINGS_VIOLATIONS_NOTE, getWarningsViolationsNoteWorker);
}
