// @flow
import React from 'react';
import { Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';

import EnrollmentsAndStatusByCourtType from './EnrollmentsAndStatusByCourtType';
import MonthlyHoursAndParticipantsGraph from './MonthlyHoursAndParticipantsGraph';
import MonthlyParticipantsByCourtType from './MonthlyParticipantsByCourtType';
import ParticipantsByCourtType from './ParticipantsByCourtType';

type Props = {
  activeEnrollmentsByCourtType :Map;
  closedEnrollmentsByCourtType :Map;
  jobSearchEnrollmentsByCourtType :Map;
  monthlyHoursWorkedByCourtType :Map;
  monthlyTotalParticipantsByCourtType :Map;
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const CourtTypeGraphs = ({
  activeEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  jobSearchEnrollmentsByCourtType,
  monthlyHoursWorkedByCourtType,
  monthlyTotalParticipantsByCourtType,
  successfulEnrollmentsByCourtType,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => (

  <CardStack>
    <EnrollmentsAndStatusByCourtType
        activeEnrollmentsByCourtType={activeEnrollmentsByCourtType}
        closedEnrollmentsByCourtType={closedEnrollmentsByCourtType}
        jobSearchEnrollmentsByCourtType={jobSearchEnrollmentsByCourtType}
        successfulEnrollmentsByCourtType={successfulEnrollmentsByCourtType}
        unsuccessfulEnrollmentsByCourtType={unsuccessfulEnrollmentsByCourtType} />
    <MonthlyHoursAndParticipantsGraph
        monthlyHoursWorkedByCourtType={monthlyHoursWorkedByCourtType}
        monthlyTotalParticipantsByCourtType={monthlyTotalParticipantsByCourtType} />
    <ParticipantsByCourtType />
    <MonthlyParticipantsByCourtType />
  </CardStack>
);

export default CourtTypeGraphs;
