// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
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
  participants :List;
  sentencesByParticipant :Map;
  resetRequestState :(actionType :string) => void;
};

type State = {
  newParticipants :List;
  pendingCompletionReview :List;
  violationsWatch :List;
};

/* react component */
class DashboardContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      newParticipants: List(),
      pendingCompletionReview: List(),
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
  }

  render() {
    const {
      newParticipants,
      pendingCompletionReview,
      violationsWatch,
    } = this.state;
    const {
      getParticipantsRequestState,
      infractionsByParticipant,
      participants,
      sentencesByParticipant,
    } = this.props;

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
                violations={infractionsByParticipant} />
          </RightWrapper>
        </DashboardBody>
      </DashboardWrapper>
    );
  }
}

export default DashboardContainer;
