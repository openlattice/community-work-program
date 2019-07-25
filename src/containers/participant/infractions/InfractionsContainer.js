// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Card,
  Select,
  Spinner
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import DigestedInfractionsContainer from './DigestedInfractionsContainer';
import NoInformation from '../../../components/participant/NoInformation';

import { getParticipantInfractions } from '../ParticipantActions';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ContainerOuterWrapper } from '../../../components/Layout';

const InfractionsOuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

const {
  ACTIONS,
  GET_PARTICIPANT_INFRACTIONS,
  REQUEST_STATE,
  VIOLATIONS,
  WARNINGS,
} = PERSON;

type Props = {
  actions:{
    getParticipantInfractions :RequestSequence;
  };
  getParticipantInfractionsState :RequestState;
  violations :List;
  warnings :List;
}

class WarningsViolationsContainer extends Component<Props> {

  handleOnSelectChange = () => {
  }

  renderNotes = () => {
    const { getParticipantInfractionsState, violations, warnings } = this.props;
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
          <NoInformation caption="No Warnings or Violations" />
        </Card>
      );
    }

    return (
      <DigestedInfractionsContainer
          infractions={infractions} />
    );
  }

  render() {
    return (
      <InfractionsOuterWrapper>
        <Select
            options={[]}
            onChange={this.handleOnSelectChange}
            placeholder="Select note..." />
        { this.renderNotes() }
      </InfractionsOuterWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  const person = state.get(STATE.PERSON);
  return {
    getParticipantInfractionsState: person.getIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE]),
    [VIOLATIONS]: person.get(VIOLATIONS),
    [WARNINGS]: person.get(WARNINGS),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getParticipantInfractions,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WarningsViolationsContainer);
