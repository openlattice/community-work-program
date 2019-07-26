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

import WorksitesTable from '../../../components/table/WorksitesTable';

import { ContainerOuterWrapper } from '../../../components/Layout';

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
  worksitePlans :List;
  worksites :Map;
};

const AssignedWorksitesContainer = ({ worksitePlans, worksites } :Props) => {
  return (
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
              <WorksitesTable
                  columnHeaders={['WORK SITE NAME', 'HRS. SERVED', 'DATE ASSIGNED']}
                  small={false}
                  worksites={worksites}
                  worksitesInfo={Map()} />
            )
        }
      </Card>
    </OuterWrapper>
  );
};

export default AssignedWorksitesContainer;
