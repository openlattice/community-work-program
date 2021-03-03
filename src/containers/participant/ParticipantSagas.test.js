// @flow
import { put } from '@redux-saga/core/effects';
import { v4 as uuid } from 'uuid';

import { getEnrollmentStatus } from './ParticipantActions';
import { getEnrollmentStatusWorker } from './ParticipantSagas';

import { GENERATOR_TAG, testShouldBeGeneratorFunction } from '../../utils/testing/TestUtils';

describe('ParticipantSagas', () => {

  describe('getEnrollmentStatusWorker', () => {

    testShouldBeGeneratorFunction(getEnrollmentStatusWorker);

    test('request', () => {

      const mockActionValue = { personEKID: uuid(), populateProfile: true };
      const workerSagaAction = getEnrollmentStatus(mockActionValue);

      const iterator = getEnrollmentStatusWorker(workerSagaAction);
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      const step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: getEnrollmentStatus.REQUEST,
          value: workerSagaAction.value
        })
      );

    });
  });
});
