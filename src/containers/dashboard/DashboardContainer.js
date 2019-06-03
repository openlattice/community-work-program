// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import NewParticipantsTable from '../../components/table/NewParticipantsTable';
import PendingReviewParticipantsTable from '../../components/table/PendingReviewParticipantsTable';
import ViolationsParticipantsTable from '../../components/table/ViolationsParticipantsTable';
import LogoLoader from '../../components/LogoLoader';

import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { GET_PARTICIPANTS } from '../participants/ParticipantsActions';

const { OPENLATTICE_ID_FQN } = Constants;
const VIOLATIONS = 'violations';

/* styled components */
const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: ${APP_CONTENT_PADDING}px;
  width: ${DASHBOARD_WIDTH};
  position: relative;
  align-self: center;
`;

const DashboardBody = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow-y: auto;
`;

const RightWrapper = styled.div`
  width: 600px;
  display: flex;
  flex-direction: column;
  margin: 0 0 30px 30px;
`;

type Props = {
  enrollmentByParticipant :Map;
  getParticipantsRequestState :RequestState;
  infractionsByParticipant :Map;
  infractionCount :Map;
  participants :List;
  sentencesByParticipant :Map;
  resetRequestState :(actionType :string) => void;
};

type State = {
  newParticipants :List;
  pendingCompletionReview :List;
  violationMap :Map;
  violationsWatch :List;
};

/* react component */
class DashboardContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      newParticipants: List(),
      pendingCompletionReview: List(),
      violationMap: Map(),
      violationsWatch: List(),
    };
  }

  componentWillReceiveProps() {
    this.getNewParticipants();
    this.getParticipantsWithHoursComplete();
    this.getParticipantsWithViolations();
  }

  componentDidUpdate() {
    const { resetRequestState } = this.props;
    resetRequestState(GET_PARTICIPANTS);
  }

  getNewParticipants = () => {
    const { enrollmentByParticipant, participants } = this.props;
  }

  getParticipantsWithHoursComplete = () => {
  }

  getParticipantsWithViolations = () => {
    const { infractionCount, participants } = this.props;

    const violationMap :Map = infractionCount.map((count :Map) => count.get(VIOLATIONS));
    const violationsWatch :List = participants.filter((participant :Map) => violationMap
      .get(participant.getIn([OPENLATTICE_ID_FQN, 0])) > 0);

    this.setState({
      violationMap,
      violationsWatch,
    });
  }

  render() {
    const {
      getParticipantsRequestState,
      sentencesByParticipant,
    } = this.props;
    const {
      newParticipants,
      pendingCompletionReview,
      violationMap,
      violationsWatch,
    } = this.state;

    if (getParticipantsRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    return (
      <DashboardWrapper>
        <DashboardBody>
          <NewParticipantsTable
              handleSelect={() => {}}
              people={newParticipants}
              sentences={sentencesByParticipant}
              selectedPersonId=""
              small
              totalParticipants={newParticipants.count()} />
          <RightWrapper>
            <PendingReviewParticipantsTable
                handleSelect={() => {}}
                people={pendingCompletionReview}
                selectedPersonId=""
                small
                totalParticipants={pendingCompletionReview.count()} />
            <ViolationsParticipantsTable
                handleSelect={() => {}}
                people={violationsWatch}
                selectedPersonId=""
                small
                totalParticipants={violationsWatch.count()}
                violations={violationMap} />
          </RightWrapper>
        </DashboardBody>
      </DashboardWrapper>
    );
  }
}

export default DashboardContainer;
