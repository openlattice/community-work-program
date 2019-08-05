// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { faFolderOpen } from '@fortawesome/pro-light-svg-icons';
import {
  Button,
  Card,
  IconSplash,
  Select,
  Spinner
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import DigestedInfractionsContainer from './DigestedInfractionsContainer';
import AddInfractionModal from './AddInfractionModal';

import { getParticipantInfractions } from '../ParticipantActions';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ContainerOuterWrapper } from '../../../components/Layout';

const InfractionsOuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

const ActionsWrapper = styled.div`
  display: grid;
  grid-gap: 0 15px;
  grid-template-columns: 5fr 1fr;
  margin: 30px;
`;

const IconSplashWrapper = styled.div`
  padding: 50px 0 70px 0;
`;

const {
  ACTIONS,
  GET_PARTICIPANT_INFRACTIONS,
  INFRACTIONS_INFO,
  REQUEST_STATE,
  VIOLATIONS,
  WARNINGS,
  WORKSITES_BY_WORKSITE_PLAN,
} = PERSON;

type Props = {
  actions:{
    getParticipantInfractions :RequestSequence;
  };
  currentStatus :string;
  getParticipantInfractionsState :RequestState;
  infractionsInfo :Map;
  personEKID :UUID;
  violations :List;
  warnings :List;
  worksitesByWorksitePlan :Map;
};

type State = {
  infractionEventModalVisible :boolean;
};

class InfractionsContainer extends Component<Props, State> {

  state = {
    infractionEventModalVisible: false,
  };

  showAddInfractionEventModal = () => {
    this.setState({
      infractionEventModalVisible: true,
    });
  }

  hideAddInfractionEventModal = () => {
    this.setState({
      infractionEventModalVisible: false,
    });
  }

  handleOnSelectChange = () => {
  }

  renderReports = () => {
    const {
      getParticipantInfractionsState,
      infractionsInfo,
      violations,
      warnings,
      worksitesByWorksitePlan,
    } = this.props;

    const infractions = violations.concat(warnings);

    if (getParticipantInfractionsState === RequestStates.PENDING) {
      return (
        <Card>
          <Spinner />
        </Card>
      );
    }
    if (infractions.isEmpty()) {
      return (
        <Card>
          <ActionsWrapper>
            <Select
                options={[]}
                onChange={this.handleOnSelectChange}
                placeholder="Select report..." />
            <Button onClick={this.showAddInfractionEventModal}>
              Create report
            </Button>
          </ActionsWrapper>
          <IconSplashWrapper>
            <IconSplash
                caption="No Warnings or Violations"
                icon={faFolderOpen}
                size="3x" />
          </IconSplashWrapper>
        </Card>
      );
    }

    return (
      <DigestedInfractionsContainer
          infractions={infractions}
          infractionsInfo={infractionsInfo}
          worksitesByWorksitePlan={worksitesByWorksitePlan} />
    );
  }

  render() {
    const {
      currentStatus,
      personEKID,
    } = this.props;
    const { infractionEventModalVisible } = this.state;
    return (
      <InfractionsOuterWrapper>
        { this.renderReports() }
        <AddInfractionModal
            currentStatus={currentStatus}
            isOpen={infractionEventModalVisible}
            onClose={this.hideAddInfractionEventModal}
            personEKID={personEKID} />
      </InfractionsOuterWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  const person = state.get(STATE.PERSON);
  return {
    getParticipantInfractionsState: person.getIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE]),
    [INFRACTIONS_INFO]: person.get(INFRACTIONS_INFO),
    [VIOLATIONS]: person.get(VIOLATIONS),
    [WARNINGS]: person.get(WARNINGS),
    [WORKSITES_BY_WORKSITE_PLAN]: person.get(WORKSITES_BY_WORKSITE_PLAN),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getParticipantInfractions,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(InfractionsContainer);
