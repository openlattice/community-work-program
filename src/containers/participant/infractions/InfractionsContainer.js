/*
 * @flow
 */

import React, { Component } from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { faFolderOpen } from '@fortawesome/pro-light-svg-icons';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  IconSplash,
  Select,
  Spinner
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddInfractionModal from './AddInfractionModal';
import InfractionDisplay from './InfractionDisplay';
import { getParticipantInfractions } from './InfractionsActions';

import { ContainerOuterWrapper } from '../../../components/Layout';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../../utils/DataUtils';
import { formatAsDate } from '../../../utils/DateTimeUtils';
import { PERSON_INFRACTIONS, STATE, WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';

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

const { DATETIME_COMPLETED, TYPE } = PROPERTY_TYPE_FQNS;
const {
  ACTIONS,
  REQUEST_STATE,
  WORKSITES_BY_WORKSITE_PLAN,
} = WORKSITE_PLANS;
const {
  ADD_INFRACTION_EVENT,
  GET_PARTICIPANT_INFRACTIONS,
  INFRACTIONS_INFO,
  VIOLATIONS,
  WARNINGS,
} = PERSON_INFRACTIONS;

type Props = {
  actions:{
    getParticipantInfractions :RequestSequence;
  };
  addInfractionEventRequestState :RequestState;
  currentStatus :string;
  getParticipantInfractionsState :RequestState;
  infractionsInfo :Map;
  participant :Map;
  violations :List;
  warnings :List;
  worksitesByWorksitePlan :Map;
};

type State = {
  infractionEventModalVisible :boolean;
  infractionOptions :Object[];
  selectedInfraction :Map;
};

class InfractionsContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const infractions :List = props.violations.concat(props.warnings);
    const { infractionOptions, selectedInfraction } = this.getInfractionStateValues(infractions);

    this.state = {
      infractionEventModalVisible: false,
      infractionOptions,
      selectedInfraction,
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { addInfractionEventRequestState, violations, warnings } = this.props;
    const { addInfractionEventRequestState: prevSumbitState } = prevProps;
    if ((addInfractionEventRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING)
      || !prevProps.violations.equals(violations)
      || !prevProps.warnings.equals(warnings)) {
      this.updateInfractionsList();
    }
  }

  updateInfractionsList = () => {
    const { violations, warnings } = this.props;
    const infractions :List = violations.concat(warnings);
    const { infractionOptions, selectedInfraction } = this.getInfractionStateValues(infractions);
    this.setState({
      infractionOptions,
      selectedInfraction,
    });
  }

  getInfractionStateValues = (infractions :List) => {
    const sortedInfractions :List = sortEntitiesByDateProperty(infractions, [DATETIME_COMPLETED]).reverse();
    const infractionOptions :Object[] = sortedInfractions
      .map((infraction :Map) => {
        const {
          [DATETIME_COMPLETED]: date,
          [TYPE]: infractionType
        } = getEntityProperties(infraction, [DATETIME_COMPLETED, TYPE]);
        const formattedDate = formatAsDate(date);
        return { label: `${infractionType} on ${formattedDate}`, value: infraction };
      });
    return { infractionOptions, selectedInfraction: sortedInfractions.first() };
  }

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

  handleOnSelectChange = (option :Object) => {
    this.setState({ selectedInfraction: option.value });
  }

  renderReports = () => {
    const {
      getParticipantInfractionsState,
      infractionsInfo,
      participant,
      violations,
      warnings,
      worksitesByWorksitePlan,
    } = this.props;
    const { infractionOptions, selectedInfraction } = this.state;

    const infractions :List = violations.concat(warnings);

    const controls :Element<*> = (
      <ActionsWrapper>
        <Select
            options={infractionOptions}
            onChange={this.handleOnSelectChange}
            placeholder="Select report..." />
        <Button onClick={this.showAddInfractionEventModal}>
          Create report
        </Button>
      </ActionsWrapper>
    );

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
          { controls }
          <IconSplashWrapper>
            <IconSplash
                caption="No Warnings or Violations"
                icon={faFolderOpen}
                size="3x" />
          </IconSplashWrapper>
        </Card>
      );
    }

    const selectedInfractionEKID :UUID = getEntityKeyId(selectedInfraction);
    const infractionInfo :Map = infractionsInfo.get(selectedInfractionEKID);
    return (
      <InfractionDisplay
          controls={controls}
          infraction={selectedInfraction}
          infractionInfo={infractionInfo}
          participant={participant}
          worksitesByWorksitePlan={worksitesByWorksitePlan} />
    );
  }

  render() {
    const {
      currentStatus,
      participant,
    } = this.props;
    const { infractionEventModalVisible } = this.state;
    const personEKID :UUID = getEntityKeyId(participant);
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
  const infractions = state.get(STATE.INFRACTIONS);
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  return {
    addInfractionEventRequestState: infractions.getIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE]),
    getParticipantInfractionsState: infractions.getIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE]),
    [INFRACTIONS_INFO]: infractions.get(INFRACTIONS_INFO),
    [VIOLATIONS]: infractions.get(VIOLATIONS),
    [WARNINGS]: infractions.get(WARNINGS),
    [WORKSITES_BY_WORKSITE_PLAN]: worksitePlans.get(WORKSITES_BY_WORKSITE_PLAN),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getParticipantInfractions,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(InfractionsContainer);
