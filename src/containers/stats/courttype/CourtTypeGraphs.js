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
  Select,
  Spinner,
} from 'lattice-ui-kit';

import PeopleAndStatusByCourtType from './PeopleAndStatusByCourtType';
import ReferralsByCourtTypeGraph from './ReferralsByCourtTypeGraph';
import { formatReferralsCourtTypeData } from '../utils/StatsUtils';
import {
  TIME_FRAME_OPTIONS,
} from '../consts/StatsConsts';

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
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;
`;

const SelectWrapper = styled.div`
  /* margin-left: 20px; */
  width: 150px;
  font-weight: normal;
`;

type Props = {
  activeEnrollmentsByCourtType :Map;
  closedEnrollmentsByCourtType :Map;
  dataIsLoading :boolean;
  referralsByCourtTypeGraphData :Map;
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const CourtTypeGraphs = ({
  activeEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  dataIsLoading,
  referralsByCourtTypeGraphData,
  successfulEnrollmentsByCourtType,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => {
  const referralsGraphData :Object[] = formatReferralsCourtTypeData(referralsByCourtTypeGraphData);
  return (
    <CardStack>
      <Card>
        <GraphHeader>Total Enrollments by Court Type</GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <PeopleAndStatusByCourtType
                    activeEnrollmentsByCourtType={activeEnrollmentsByCourtType}
                    closedEnrollmentsByCourtType={closedEnrollmentsByCourtType}
                    successfulEnrollmentsByCourtType={successfulEnrollmentsByCourtType}
                    toolTipStyle={toolTipStyle}
                    unsuccessfulEnrollmentsByCourtType={unsuccessfulEnrollmentsByCourtType} />
              )
          }
        </CardSegment>
      </Card>
      <Card>
        <GraphHeader>
          <div>Number of Referrals (Repeat Enrollments) by Court Type</div>
          <SelectWrapper>
            <Select options={TIME_FRAME_OPTIONS} />
          </SelectWrapper>
        </GraphHeader>
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
    </CardStack>
  );
};

export default CourtTypeGraphs;
