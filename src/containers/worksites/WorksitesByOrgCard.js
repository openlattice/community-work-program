// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Card, CardSegment } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';

import WorksitesTable from '../../components/table/WorksitesTable';
import AddWorksiteModal from './AddWorksiteModal';

import { goToRoute } from '../../core/router/RoutingActions';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  SmallSeparator,
  SubtitleWrapper,
  Subtitle,
  Status,
} from '../../components/Layout';
import { OL } from '../../core/style/Colors';
import * as Routes from '../../core/router/Routes';

const { DESCRIPTION, ORGANIZATION_NAME } = PROPERTY_TYPE_FQNS;

const WORKSITES_COLUMNS = [
  'WORK SITE NAME',
  'STATUS',
  'START DATE',
  'SCHED. PARTIC.',
  'PAST PARTIC.',
  'TOTAL HOURS'
];

const OrgCard = styled(Card)`
  padding: 10px 20px;
  & > ${CardSegment} {
    border: none;
  }
  & > ${CardSegment}:first-child {
    justify-content: center;
  }
  & > ${CardSegment}:last-child {
    margin: 0 -20px 0 -20px;
    padding: 0;
  }
`;

const TitleRowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrganizationName = styled.h1`
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 20px;
  &:hover {
    cursor: pointer;
    color: ${OL.PURPLE02};
  }
  &:active {
    color: ${OL.PURPLE01};
  }
`;

const Description = styled.div`
  color: ${OL.GREY15};
  font-size: 14px;
`;

const StyledButton = styled(Button)`
  font-size: 13px;
  padding: 6px 12px;
`;

type Props = {
  actions:{
    goToRoute :RequestSequence;
  };
  organization :Map;
  orgStatus :string;
  worksiteCount :string;
  worksites :List;
  worksitesInfo :Map;
};

type State = {
  showAddWorksite :boolean;
};

class WorksitesByOrgCard extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      showAddWorksite: false,
    };
  }

  handleShowAddWorksite = () => {
    this.setState({
      showAddWorksite: true
    });
  }

  handleHideAddWorksite = () => {
    this.setState({
      showAddWorksite: false
    });
  }

  goToWorksiteProfile = (worksite :Map) => {
    const { actions } = this.props;
    const worksiteEKID :UUID = getEntityKeyId(worksite);
    actions.goToRoute(Routes.WORKSITE_PROFILE.replace(':worksiteId', worksiteEKID));
  }

  render() {
    const {
      organization,
      orgStatus,
      worksiteCount,
      worksites,
      worksitesInfo,
    } = this.props;
    const { showAddWorksite } = this.state;

    const {
      [DESCRIPTION]: orgDescription,
      [ORGANIZATION_NAME]: orgName
    } = getEntityProperties(organization, [DESCRIPTION, ORGANIZATION_NAME]);
    return (
      <OrgCard>
        <CardSegment vertical padding="md">
          <TitleRowWrapper>
            <OrganizationName>
              { orgName }
            </OrganizationName>
            <StyledButton onClick={this.handleShowAddWorksite}>Add Work Site</StyledButton>
          </TitleRowWrapper>
          <SubtitleWrapper>
            <Subtitle>{ worksiteCount }</Subtitle>
            <SmallSeparator>•</SmallSeparator>
            <Status status={orgStatus}>
              { orgStatus }
            </Status>
          </SubtitleWrapper>
        </CardSegment>
        <CardSegment padding="md">
          <Description>{ orgDescription }</Description>
        </CardSegment>
        <CardSegment padding="sm">
          {
            (worksites && worksites.count() > 0)
              ? (
                <WorksitesTable
                    columnHeaders={WORKSITES_COLUMNS}
                    small={false}
                    selectWorksite={this.goToWorksiteProfile}
                    tableMargin="0"
                    worksites={worksites}
                    worksitesInfo={worksitesInfo} />
              ) : null
          }
          <AddWorksiteModal
              isOpen={showAddWorksite}
              onClose={this.handleHideAddWorksite}
              organization={organization} />
        </CardSegment>
      </OrgCard>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(WorksitesByOrgCard);
