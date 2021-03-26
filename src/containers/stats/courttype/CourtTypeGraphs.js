// @flow
import React from 'react';

import { Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';

import EnrollmentsAndStatusByCourtType from './EnrollmentsAndStatusByCourtType';
import HoursByCourtType from './HoursByCourtType';
import MonthlyParticipantsByCourtType from './MonthlyParticipantsByCourtType';
import ParticipantsByCourtType from './ParticipantsByCourtType';

type Props = {
  activeEnrollmentsByCourtType :Map;
  becameActiveEnrollmentsByCourtType :Map,
  closedEnrollmentsByCourtType :Map;
  jobSearchEnrollmentsByCourtType :Map;
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const CourtTypeGraphs = ({
  activeEnrollmentsByCourtType,
  becameActiveEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  jobSearchEnrollmentsByCourtType,
  successfulEnrollmentsByCourtType,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => (

  <CardStack>
    <EnrollmentsAndStatusByCourtType
        activeEnrollmentsByCourtType={activeEnrollmentsByCourtType}
        becameActiveEnrollmentsByCourtType={becameActiveEnrollmentsByCourtType}
        closedEnrollmentsByCourtType={closedEnrollmentsByCourtType}
        jobSearchEnrollmentsByCourtType={jobSearchEnrollmentsByCourtType}
        successfulEnrollmentsByCourtType={successfulEnrollmentsByCourtType}
        unsuccessfulEnrollmentsByCourtType={unsuccessfulEnrollmentsByCourtType} />
    <HoursByCourtType />
    <ParticipantsByCourtType />
    <MonthlyParticipantsByCourtType />
  </CardStack>
);

export default CourtTypeGraphs;
