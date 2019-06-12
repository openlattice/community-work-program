// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';
import type { RouterHistory } from 'react-router';

import ParticipantsTable from '../../components/table/ParticipantsTable';
import LogoLoader from '../../components/LogoLoader';

import { getEntityProperties } from '../../utils/DataUtils';
import { ErrorMessage } from '../../components/Layout';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { ENROLLMENT_STATUSES, HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import {
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  SENTENCE_TERM_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
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
const { DATETIME_START } = SENTENCE_TERM_FQNS;
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
  history :RouterHistory,
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

  componentDidMount() {
    const { participants } = this.props;
    if (participants.count() > 0) {
      this.getNewParticipants();
      this.getParticipantsWithHoursComplete();
      this.getParticipantsWithViolations();
    }
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

    const { enrollmentByParticipant, participants, sentenceTermsByParticipant } = this.props;
    if (enrollmentByParticipant.count() > 0 && participants.count() > 0) {

      const newParticipants = participants.filter((participant :Map) => {
        const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(participant, [ENTITY_KEY_ID]);
        if (enrollmentByParticipant.get(personEntityKeyId).count() === 0) { // if no existing worksite enrollments
          return participant;
        }

        const isAwaitingEnrollment :boolean = enrollmentByParticipant.get(personEntityKeyId)
          .getIn([STATUS, 0]) === ENROLLMENT_STATUSES.AWAITING_ENROLLMENT;
        const hasActiveSentence :boolean = DateTime.fromISO(
          sentenceTermsByParticipant.getIn([personEntityKeyId, DATETIME_START, 0])
        ).diff(DateTime.local(), 'days') < 90;

        // if person was enrolled in CWP previously
        if (!isAwaitingEnrollment && hasActiveSentence) {
          return participant;
        }
        return isAwaitingEnrollment;
      });

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
      return violationMap.get(personEntityKeyId);
    });

    this.setState({
      violationMap,
      violationsWatch,
    });
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { history } = this.props;
    history.push(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
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
              ageRequired={false}
              bannerText="New Participants"
              columnHeaders={newParticipantsColumns}
              datesToInclude={{
                deadline: true,
                sentence: true,
                sentenceEnd: false,
                start: false
              }}
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              hoursToInclude={{ requiredHours: true, workedHours: false }}
              people={newParticipants}
              small
              sentenceTerms={sentenceTermsByParticipant}
              totalTableItems={newParticipants.count()} />
          <RightWrapper>
            <ParticipantsTable
                ageRequired={false}
                bannerText="Pending Completion Review"
                columnHeaders={pendingCompletionColumns}
                datesToInclude={{
                  deadline: false,
                  sentence: true,
                  sentenceEnd: false,
                  start: false
                }}
                handleSelect={this.handleOnSelectPerson}
                hours={hoursWorked}
                hoursToInclude={{ requiredHours: true, workedHours: false }}
                people={pendingCompletionReview}
                small
                sentenceTerms={sentenceTermsByParticipant}
                totalTableItems={pendingCompletionReview.count()} />
            <ParticipantsTable
                ageRequired={false}
                bannerText="Violations Watch"
                columnHeaders={violationsWatchColumns}
                datesToInclude={{
                  deadline: false,
                  sentence: false,
                  sentenceEnd: false,
                  start: false
                }}
                handleSelect={this.handleOnSelectPerson}
                hours={hoursWorked}
                hoursToInclude={{ requiredHours: true, workedHours: true }}
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
