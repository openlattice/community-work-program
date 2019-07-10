// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import WorksitesTable from '../table/WorksitesTable';
import AddWorksiteModal from '../../containers/worksites/AddWorksiteModal';

import { getEntityProperties } from '../../utils/DataUtils';
import { ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { DATA, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  SmallSeparator,
  SubtitleWrapper,
  Subtitle,
  Status,
} from '../Layout';
import { OL } from '../../core/style/Colors';

const { DESCRIPTION, ORGANIZATION_NAME } = ORGANIZATION_FQNS;

const WORKSITES_COLUMNS = [
  'WORK SITE NAME',
  'STATUS',
  'START DATE',
  'SCHED. PARTIC.',
  'PAST PARTIC.',
  'TOTAL HOURS'
];

const OrgCard = styled(Card)`
  border-radius: 5px;
  margin-bottom: 20px;
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
  onClickWorksite ? :(worksite :Map) => void;
  organization :Map;
  orgStatus :string;
  submitDataGraphRequestState :RequestState;
  updateOrgsList :() => void;
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

  static defaultProps = {
    onClickWorksite: () => {},
  };

  componentDidUpdate(prevProps :Props, prevState :State) {
    const { submitDataGraphRequestState, updateOrgsList } = this.props;
    const { showAddWorksite } = this.state;

    if (prevState.showAddWorksite && !showAddWorksite) {
      if (submitDataGraphRequestState === RequestStates.SUCCESS) {
        updateOrgsList();
      }
    }
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

  render() {
    const {
      onClickWorksite,
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
                    selectWorksite={onClickWorksite}
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

const mapStateToProps = (state :Map) => ({
  submitDataGraphRequestState: state.getIn([STATE.DATA, DATA.ACTIONS, DATA.SUBMIT_DATA_GRAPH, DATA.REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(WorksitesByOrgCard);
