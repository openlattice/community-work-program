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

const WORKSITES_COLUMN_HEADERS :string[] = ['WORK SITE NAME', 'HRS. SERVED', 'DATE ASSIGNED'];

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
                  columnHeaders={WORKSITES_COLUMN_HEADERS}
                  config={{
                    includeStartDate: false,
                    includesStatus: false,
                  }}
                  small={false}
                  worksites={worksites} />
            )
        }
      </Card>
    </OuterWrapper>
  );
};

export default AssignedWorksitesContainer;
