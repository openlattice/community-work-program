// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { faTools } from '@fortawesome/pro-light-svg-icons';
import {
  Card,
  CardSegment,
  IconSplash,
} from 'lattice-ui-kit';

import AssignedWorksitesTable from '../../../components/table/AssignedWorksitesTable';

import { ContainerOuterWrapper } from '../../../components/Layout';

const WORKSITES_COLUMN_HEADERS :string[] = ['WORK SITE NAME', 'HOURS WORKED', 'REQ. HOURS', 'STATUS'];

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
  worksitePlans :List;
  worksitePlanStatuses :Map;
  worksitesByWorksitePlan :Map;
};

const AssignedWorksitesContainer = ({ worksitePlans, worksitePlanStatuses, worksitesByWorksitePlan } :Props) => (
  <OuterWrapper>
    <Card>
      {
        worksitePlans.count() === 0
          ? (
            <CardSegment>
              <IconSplash
                  caption="No Assigned Work Sites"
                  icon={faTools}
                  size="3x" />
            </CardSegment>
          )
          : (
            <AssignedWorksitesTable
                columnHeaders={WORKSITES_COLUMN_HEADERS}
                small={false}
                tableMargin="25px 0"
                worksitesByWorksitePlan={worksitesByWorksitePlan}
                worksitePlans={worksitePlans}
                worksitePlanStatuses={worksitePlanStatuses} />
          )
      }
    </Card>
  </OuterWrapper>
);

export default AssignedWorksitesContainer;
