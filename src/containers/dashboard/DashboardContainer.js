// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import ParticipantsTable from '../../components/table/ParticipantsTable';
import LogoLoader from '../../components/LogoLoader';

import { getEntityProperties } from '../../utils/DataUtils';
import { ErrorMessage } from '../../components/Layout';
import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { ENROLLMENT_STATUSES, HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_FQNS, ENTITY_KEY_ID } from '../../core/edm/constants/FullyQualifiedNames';
import { PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  newParticipantsColumns,
  pendingCompletionColumns,
  violationsWatchColumns,
} from '../../utils/constants/UIConsts';

/* constants */
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;
const VIOLATIONS = 'violations';
const {
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  SENTENCE_TERMS_BY_PARTICIPANT,
} = PEOPLE;

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
  width: 100%;
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
  getSentencesRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
  sentenceTermsByParticipant :Map;
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

  componentDidUpdate(prevProps :Props) {
    const { participants } = this.props;
    if (prevProps.participants.count() !== participants.count()) {
      this.getNewParticipants();
      this.getParticipantsWithHoursComplete();
      this.getParticipantsWithViolations();
    }
  }

  getNewParticipants = () => {

    const { enrollmentByParticipant, participants } = this.props;
    if (enrollmentByParticipant.count() > 0 && participants.count() > 0) {

      const newParticipants = enrollmentByParticipant.filter(((enrollmentStatuses :List) => enrollmentStatuses
        .map((enrollment :Map) => {
          const { [STATUS]: status } = getEntityProperties(enrollment, [STATUS]);
          const planned :boolean = status === ENROLLMENT_STATUSES.PLANNED;
          const noStatus :boolean = enrollment.count() === 0;
          return (planned || noStatus);
        })))
        .keySeq()
        .toList()
        .map((ekid :UUID) => participants
          .find((participant :Map) => {
            const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(participant, [ENTITY_KEY_ID]);
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
    participantsWithHoursComplete.forEach((hours :Map, ekid :UUID) => {
      const participant :Map = participants.find((person :Map) => {
        const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(person, [ENTITY_KEY_ID]);
        return personEntityKeyId === ekid;
      });
      pendingCompletionReview = pendingCompletionReview.push(participant);
    });

    this.setState({
      pendingCompletionReview,
    });
  }

  getParticipantsWithViolations = () => {

    const { infractionCountsByParticipant, participants } = this.props;
    const violationMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(VIOLATIONS));
    const violationsWatch :List = participants.filter((participant :Map) => {
      const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(participant, [ENTITY_KEY_ID]);
      return violationMap.get(personEntityKeyId, List()) > 0;
    });

    this.setState({
      violationMap,
      violationsWatch,
    });
  }

  render() {
    const {
      getSentencesRequestState,
      hoursWorked,
      sentenceTermsByParticipant,
    } = this.props;
    const {
      newParticipants,
      pendingCompletionReview,
      violationMap,
      violationsWatch,
    } = this.state;

    if (getSentencesRequestState === RequestStates.PENDING
        || getSentencesRequestState === RequestStates.STANDBY) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    if (getSentencesRequestState === RequestStates.FAILURE) {
      return (
        <ErrorMessage>
          Sorry, something went wrong. Please try refreshing the page, or contact support if the problem persists.
        </ErrorMessage>
      );
    }

    return (
      <DashboardWrapper>
        <DashboardBody>
          <ParticipantsTable
              bannerText="New Participants"
              columnHeaders={newParticipantsColumns}
              hours={hoursWorked}
              includeDeadline
              onlyReqHours
              people={newParticipants}
              small
              sentenceTerms={sentenceTermsByParticipant}
              totalTableItems={newParticipants.count()} />
          <RightWrapper>
            <ParticipantsTable
                bannerText="Pending Completion Review"
                columnHeaders={pendingCompletionColumns}
                hours={hoursWorked}
                onlyReqHours
                people={pendingCompletionReview}
                small
                sentenceTerms={sentenceTermsByParticipant}
                totalTableItems={pendingCompletionReview.count()} />
            <ParticipantsTable
                bannerText="Violations Watch"
                columnHeaders={violationsWatchColumns}
                hours={hoursWorked}
                onlyReqHours={false}
                people={violationsWatch}
                small
                totalTableItems={violationsWatch.count()}
                violations={violationMap} />
          </RightWrapper>
        </DashboardBody>
      </DashboardWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const people = state.get(STATE.PEOPLE);
  return {
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    getSentencesRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_SENTENCES, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [SENTENCE_TERMS_BY_PARTICIPANT]: people.get(SENTENCE_TERMS_BY_PARTICIPANT),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(DashboardContainer);
