// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  Spinner,
} from 'lattice-ui-kit';

import EnrollmentsByCourtTypeGraph from './EnrollmentsByCourtTypeGraph';
import PeopleByCourtTypeGraph from './PeopleByCourtTypeGraph';
import ReferralsByCourtTypeGraph from './ReferralsByCourtTypeGraph';
import {
  formatEnrollmentsCourtTypeData,
  formatPeopleCourtTypeData,
  formatReferralsCourtTypeData
} from '../utils/StatsUtils';

const { BLACK, WHITE } = Colors;
const toolTipStyle :Object = {
  borderRadius: '3px',
  color: WHITE,
  display: 'flex',
  fontFamily: 'Open Sans, sans-serif',
  fontSize: '13px',
  padding: '5px 10px',
};

const GraphHeader = styled(CardHeader)`
  color: ${BLACK};
  font-size: 20px;
  font-weight: 600;
`;

type Props = {
  activePeopleByCourtTypeGraphData :Map;
  dataIsLoading :boolean;
  enrollmentsByCourtTypeGraphData :Map;
  referralsByCourtTypeGraphData :Map;
  successfulPeopleByCourtTypeGraphData :Map;
  unsuccessfulPeopleByCourtTypeGraphData :Map;
};

const CourtTypeGraphs = ({
  activePeopleByCourtTypeGraphData,
  dataIsLoading,
  enrollmentsByCourtTypeGraphData,
  referralsByCourtTypeGraphData,
  successfulPeopleByCourtTypeGraphData,
  unsuccessfulPeopleByCourtTypeGraphData,
} :Props) => {
  const enrollmentsGraphData :Object[] = formatEnrollmentsCourtTypeData(enrollmentsByCourtTypeGraphData);
  const activePeopleGraphData :Object[] = formatPeopleCourtTypeData(activePeopleByCourtTypeGraphData);
  const referralsGraphData :Object[] = formatReferralsCourtTypeData(referralsByCourtTypeGraphData);
  const successfulPeopleGraphData :Object[] = formatPeopleCourtTypeData(successfulPeopleByCourtTypeGraphData);
  const unsuccessfulPeopleGraphData :Object[] = formatPeopleCourtTypeData(unsuccessfulPeopleByCourtTypeGraphData);
  return (
    <CardStack>
      <Card>
        <GraphHeader>Number of Enrollments by Court Type</GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <EnrollmentsByCourtTypeGraph
                    enrollmentsGraphData={enrollmentsGraphData}
                    toolTipStyle={toolTipStyle} />
              )
          }
        </CardSegment>
      </Card>
      <Card>
        <GraphHeader>Number of Referrals (Repeat Enrollments) by Court Type</GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <ReferralsByCourtTypeGraph
                    referralsGraphData={referralsGraphData}
                    toolTipStyle={toolTipStyle} />
              )
          }
        </CardSegment>
      </Card>
      <Card>
        <GraphHeader>Number of Participants by Court Type</GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <PeopleByCourtTypeGraph
                    activePeopleGraphData={activePeopleGraphData}
                    successfulPeopleGraphData={successfulPeopleGraphData}
                    toolTipStyle={toolTipStyle}
                    unsuccessfulPeopleGraphData={unsuccessfulPeopleGraphData} />
              )
          }
        </CardSegment>
      </Card>
    </CardStack>
  );
};

export default CourtTypeGraphs;
