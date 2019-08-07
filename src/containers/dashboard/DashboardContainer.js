// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ParticipantsTable from '../../components/table/ParticipantsTable';
import LogoLoader from '../../components/LogoLoader';

import { ErrorMessage } from '../../components/Layout';
import { getSentences } from '../participants/ParticipantsActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { ENROLLMENT_STATUSES, HOURS_CONSTS, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { DATETIME_START, ENROLLMENT_STATUS_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';

/* constants */
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;
const {
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  SENTENCE_TERMS_BY_PARTICIPANT,
} = PEOPLE;

const NEW_PARTICIPANTS_COLUMNS = ['NAME', 'SENT. DATE', 'CHECK-IN DEADLINE', 'STATUS', 'REQ. HRS.'];
const PENDING_PARTICIPANTS_COLUMNS = ['NAME', 'SENT. DATE', 'REQ. HRS.'];
const VIOLATIONS_WATCH_COLUMNS = ['NAME', '# OF VIO.', 'HRS. SERVED'];

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
  actions:{
    getSentences :RequestSequence;
    goToRoute :RequestSequence;
  };
  app :Map;
  enrollmentByParticipant :Map;
  getInitializeAppRequestState :RequestState;
  getSentencesRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
  sentenceTermsByParticipant :Map;
};

type State = {
  newParticipants :List;
  noShows :List;
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
      noShows: List(),
      pendingCompletionReview: List(),
      violationMap: Map(),
      violationsWatch: List(),
    };
  }

  componentDidMount() {
    const { participants } = this.props;
    if (participants.count() > 0) {
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, app, participants } = this.props;
    if (prevProps.app.count() !== app.count()) {
      actions.getSentences();
    }
    if (prevProps.participants.count() !== participants.count()) {
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { actions } = this.props;
    actions.goToRoute(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  setNewParticipants = (noShows :List) => {

    const { enrollmentByParticipant, participants, sentenceTermsByParticipant } = this.props;
    if (enrollmentByParticipant.count() > 0 && participants.count() > 0) {

      const newParticipants = participants.filter((participant :Map) => {

        // If person hasn't checked in by the deadline, they should be in Violations Watch table instead:
        const participantIsNoShow :boolean = noShows.includes(participant);
        if (participantIsNoShow) return false;

        // If participant doesn't have enrollment status, they are newly integrated:
        const personEKID :UUID = getEntityKeyId(participant);
        if (enrollmentByParticipant.get(personEKID).count() === 0) { // if no existing enrollment
          return true;
        }

        // If person is awaiting check-in or awaiting orientation, they should be in New Participants:
        const status :string = enrollmentByParticipant.get(personEKID)
          .getIn([STATUS, 0]);
        const isAwaitingEnrollment :boolean = status === ENROLLMENT_STATUSES.AWAITING_CHECKIN
          || status === ENROLLMENT_STATUSES.AWAITING_ORIENTATION;
        const hasActiveSentence :boolean = DateTime.local().diff(DateTime.fromISO(
          sentenceTermsByParticipant.getIn([personEKID, DATETIME_START, 0])
        ), 'days').days < 90;

        // If person was enrolled in CWP previously and is now enrolled again but doesn't have correct status:
        if (!isAwaitingEnrollment && hasActiveSentence) {
          // Filter out the people who are simply active in CWP:
          if (status === ENROLLMENT_STATUSES.ACTIVE
              || status === ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT || status === ENROLLMENT_STATUSES.ACTIVE_REOPENED) {
            return false;
          }
          return true;
        }

        return isAwaitingEnrollment;
      });

      this.setState({
        newParticipants,
      });
    }
  }

  setParticipantsWithHoursComplete = () => {

    const { enrollmentByParticipant, hoursWorked, participants } = this.props;
    const participantsWithHoursComplete :Map = hoursWorked
      .filter((hours :Map) => (hours.get(WORKED) === hours.get(REQUIRED)));

    let pendingCompletionReview :List = List();
    participantsWithHoursComplete.forEach((hours :Map, ekid :UUID) => {

      const participant :Map = participants.find((person :Map) => {
        const personEKID :UUID = getEntityKeyId(person);
        return personEKID === ekid;
      });

      const participantEnrollment = enrollmentByParticipant.get(getEntityKeyId(participant));
      const { [STATUS]: status } = getEntityProperties(participantEnrollment, [STATUS]);
      if (status !== ENROLLMENT_STATUSES.COMPLETED
        || status !== ENROLLMENT_STATUSES.CLOSED
        || status !== ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT) {
        pendingCompletionReview = pendingCompletionReview.push(participant);
      }
    });

    this.setState({
      pendingCompletionReview,
    });
  }

  setParticipantsWithViolations = () => {

    const {
      enrollmentByParticipant,
      infractionCountsByParticipant,
      participants,
      sentenceTermsByParticipant,
    } = this.props;

    const violationMap :Map = infractionCountsByParticipant
      .map((count :Map) => count.get(INFRACTIONS_CONSTS.VIOLATION));

    // Get participants with registered violations:
    let violationsWatch :List = participants.filter((participant :Map) => {
      const personEKID :UUID = getEntityKeyId(participant);
      const participantEnrollment = enrollmentByParticipant.get(personEKID);
      const { [STATUS]: status } = getEntityProperties(participantEnrollment, [STATUS]);
      return violationMap.get(personEKID)
        && (status === ENROLLMENT_STATUSES.ACTIVE || status === ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT);
    });
    // Get participants who haven't checked in by their check-in deadline:
    const noShows :List = participants.filter((participant :Map) => {
      const personEKID :UUID = getEntityKeyId(participant);
      const sentenceTerm = sentenceTermsByParticipant.get(personEKID);
      const { [DATETIME_START]: sentenceDate } = getEntityProperties(sentenceTerm, [DATETIME_START]);
      let checkInDeadline = '';
      if (sentenceDate) checkInDeadline = DateTime.fromISO(sentenceDate).plus({ hours: 48 });
      let pastDeadline = false;
      if (checkInDeadline) {
        const now = DateTime.local();
        pastDeadline = now > checkInDeadline;
      }
      return pastDeadline;
    });

    violationsWatch = violationsWatch.concat(noShows);
    this.setNewParticipants(noShows);

    this.setState({
      noShows,
      violationMap,
      violationsWatch,
    });
  }

  render() {
    const {
      enrollmentByParticipant,
      getInitializeAppRequestState,
      getSentencesRequestState,
      hoursWorked,
      sentenceTermsByParticipant,
    } = this.props;
    const {
      newParticipants,
      noShows,
      pendingCompletionReview,
      violationMap,
      violationsWatch,
    } = this.state;

    if (getSentencesRequestState === RequestStates.PENDING || getInitializeAppRequestState === RequestStates.PENDING) {
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
              columnHeaders={NEW_PARTICIPANTS_COLUMNS}
              config={{
                includeDeadline: true,
                includeRequiredHours: true,
                includeSentenceDate: true,
                includeSentenceEndDate: false,
                includeStartDate: false,
                includeWorkedHours: false
              }}
              enrollment={enrollmentByParticipant}
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              people={newParticipants}
              small
              sentenceTerms={sentenceTermsByParticipant}
              totalTableItems={newParticipants.count()}
              width="700px" />
          <RightWrapper>
            <ParticipantsTable
                ageRequired={false}
                bannerText="Pending Completion Review"
                columnHeaders={PENDING_PARTICIPANTS_COLUMNS}
                config={{
                  includeDeadline: false,
                  includeRequiredHours: true,
                  includeSentenceDate: true,
                  includeSentenceEndDate: false,
                  includeStartDate: false,
                  includeWorkedHours: false
                }}
                handleSelect={this.handleOnSelectPerson}
                hours={hoursWorked}
                people={pendingCompletionReview}
                small
                sentenceTerms={sentenceTermsByParticipant}
                totalTableItems={pendingCompletionReview.count()}
                width="600px" />
            <ParticipantsTable
                ageRequired={false}
                bannerText="Violations Watch"
                columnHeaders={VIOLATIONS_WATCH_COLUMNS}
                config={{
                  includeDeadline: false,
                  includeRequiredHours: true,
                  includeSentenceDate: false,
                  includeSentenceEndDate: false,
                  includeStartDate: false,
                  includeWorkedHours: true
                }}
                handleSelect={this.handleOnSelectPerson}
                hours={hoursWorked}
                noShows={noShows}
                people={violationsWatch}
                small
                totalTableItems={violationsWatch.count()}
                violations={violationMap}
                width="600px" />
          </RightWrapper>
        </DashboardBody>
      </DashboardWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  return {
    app,
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    getSentencesRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_SENTENCES, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [SENTENCE_TERMS_BY_PARTICIPANT]: people.get(SENTENCE_TERMS_BY_PARTICIPANT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getSentences,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
