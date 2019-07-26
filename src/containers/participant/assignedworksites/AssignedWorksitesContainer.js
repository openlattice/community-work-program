// @flow
import React, { Component } from 'react';
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
  worksites :List;
};

class AssignedWorksitesContainer extends Component<Props> {

  render() {
    const { worksites } = this.props;
    return (
      <OuterWrapper>
        <Card>
          {
            worksites.count() === 0
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
                    selectWorksite={() => {}}
                    tableMargin="0"
                    worksites={worksites}
                    worksitesInfo={Map()} />
              )
          }
        </Card>
      </OuterWrapper>
    );
  }
}

export default AssignedWorksitesContainer;
