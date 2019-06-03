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

import { getEntityProperties } from '../../utils/DataUtils';
import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { GET_PARTICIPANTS } from '../participants/ParticipantsActions';
import { ENROLLMENT_STATUSES, HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_FQNS, ENTITY_KEY_ID } from '../../core/edm/constants/FullyQualifiedNames';

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;
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
  hoursWorked :Map;
  infractionsByParticipant :Map;
  infractionCount :Map;
  participants :List;
  sentenceTerms :Map;
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
    const { participants } = this.props;
    if (participants.count() > 0) {
      this.getNewParticipants();
      this.getParticipantsWithHoursComplete();
      this.getParticipantsWithViolations();
    }
  }

  componentDidUpdate() {
    const { resetRequestState } = this.props;
    resetRequestState(GET_PARTICIPANTS);
  }

  getNewParticipants = () => {

    const { enrollmentByParticipant, participants } = this.props;
    if (enrollmentByParticipant.count() > 0 && participants.count() > 0) {

      const newParticipants = enrollmentByParticipant.filter((enrollment :Map) => {
        const { [STATUS]: status } = getEntityProperties(enrollment, [STATUS]);
        return status === ENROLLMENT_STATUSES.PLANNED;
      })
        .keySeq()
        .toList()
        .map((ekid :string) => participants
          .find((participant :Map) => {
            const { [ENTITY_KEY_ID]: personEntityKeyId } = getEntityProperties(participant, [ENTITY_KEY_ID]);
            return personEntityKeyId === ekid;
          }));
      this.setState({
        newParticipants,
      });
    }
  }

  getParticipantsWithHoursComplete = () => {

    const { hoursWorked, participants } = this.props;
    const participantsWithHoursComplete :Map = hoursWorked
      .filter((hours :Map) => hours.get(WORKED) === hours.get(REQUIRED));

    let pendingCompletionReview :List = List();
    participantsWithHoursComplete.forEach((hours :Map, ekid :string) => {
      const participant :Map = participants.find((person :Map) => {
        const { [ENTITY_KEY_ID]: personEntityKeyId } = getEntityProperties(person, [ENTITY_KEY_ID]);
        return personEntityKeyId === ekid;
      });
      pendingCompletionReview = pendingCompletionReview.push(participant);
    });
    this.setState({
      pendingCompletionReview,
    });
  }

  getParticipantsWithViolations = () => {

    const { infractionCount, participants } = this.props;
    const violationMap :Map = infractionCount.map((count :Map) => count.get(VIOLATIONS));
    const violationsWatch :List = participants.filter((participant :Map) => {
      const { [ENTITY_KEY_ID]: personEntityKeyId } = getEntityProperties(participant, [ENTITY_KEY_ID]);
      return violationMap.get(personEntityKeyId) > 0;
    });
    this.setState({
      violationMap,
      violationsWatch,
    });
  }

  render() {
    const {
      getParticipantsRequestState,
      hoursWorked,
      sentenceTerms,
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
              hoursWorked={hoursWorked}
              people={newParticipants}
              small
              sentenceTerms={sentenceTerms}
              totalParticipants={newParticipants.count()} />
          <RightWrapper>
            <PendingReviewParticipantsTable
                hoursWorked={hoursWorked}
                people={pendingCompletionReview}
                small
                sentenceTerms={sentenceTerms}
                totalParticipants={pendingCompletionReview.count()} />
            <ViolationsParticipantsTable
                hoursWorked={hoursWorked}
                people={violationsWatch}
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
