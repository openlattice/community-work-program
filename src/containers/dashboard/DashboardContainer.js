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
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { getEntityKeyId } from '../../utils/DataUtils';
import { ENROLLMENT_STATUSES, HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_FQNS, SENTENCE_TERM_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';

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

const NEW_PARTICIPANTS_COLUMNS = ['NAME', 'SENT. DATE', 'ENROLL. DEADLINE', 'REQ. HRS.'];
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
    goToRoute :RequestSequence;
  };
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
      this.setNewParticipants();
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { participants } = this.props;
    if (prevProps.participants.count() !== participants.count()) {
      this.setNewParticipants();
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { actions } = this.props;
    actions.goToRoute(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  setNewParticipants = () => {

    const { enrollmentByParticipant, participants, sentenceTermsByParticipant } = this.props;
    if (enrollmentByParticipant.count() > 0 && participants.count() > 0) {

      const newParticipants = participants.filter((participant :Map) => {
        const personEKID :UUID = getEntityKeyId(participant);
        if (enrollmentByParticipant.get(personEKID).count() === 0) { // if no existing worksite enrollments
          return true;
        }

        const isAwaitingEnrollment :boolean = enrollmentByParticipant.get(personEKID)
          .getIn([STATUS, 0]) === ENROLLMENT_STATUSES.AWAITING_ENROLLMENT;
        const hasActiveSentence :boolean = DateTime.fromISO(
          sentenceTermsByParticipant.getIn([personEKID, DATETIME_START, 0])
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

  setParticipantsWithHoursComplete = () => {

    const { hoursWorked, participants } = this.props;
    const participantsWithHoursComplete :Map = hoursWorked
      .filter((hours :Map) => hours.get(WORKED) === hours.get(REQUIRED));

    let pendingCompletionReview :List = List();
    participantsWithHoursComplete.forEach((hours :Map, ekid :UUID) => {
      const participant :Map = participants.find((person :Map) => {
        const personEKID :UUID = getEntityKeyId(person);
        return personEKID === ekid;
      });
      pendingCompletionReview = pendingCompletionReview.push(participant);
    });

    this.setState({
      pendingCompletionReview,
    });
  }

  setParticipantsWithViolations = () => {

    const { infractionCountsByParticipant, participants } = this.props;
    const violationMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(VIOLATIONS));
    const violationsWatch :List = participants.filter((participant :Map) => {
      const personEKID :UUID = getEntityKeyId(participant);
      return violationMap.get(personEKID);
    });

    this.setState({
      violationMap,
      violationsWatch,
    });
  }

  render() {
    const {
      getInitializeAppRequestState,
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
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              people={newParticipants}
              setWidth
              small
              sentenceTerms={sentenceTermsByParticipant}
              totalTableItems={newParticipants.count()} />
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
                setWidth
                small
                sentenceTerms={sentenceTermsByParticipant}
                totalTableItems={pendingCompletionReview.count()} />
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
                people={violationsWatch}
                setWidth
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
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  return {
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
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
