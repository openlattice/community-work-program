// @flow
import React from 'react';

import { Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';

import CourtTypeStatsTable from './CourtTypeStatsTable';
import EnrollmentsAndStatusByCourtType from './EnrollmentsAndStatusByCourtType';
import HoursByCourtType from './HoursByCourtType';
import MonthlyParticipantsByCourtType from './MonthlyParticipantsByCourtType';
import ParticipantsByCourtType from './ParticipantsByCourtType';
import ReferralsByCourtType from './ReferralsByCourtType';

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
    <CourtTypeStatsTable />
    <ReferralsByCourtType />
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
