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
import { getDiversionPlans } from '../participants/ParticipantsActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { DASHBOARD_WIDTH } from '../../core/style/Sizes';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { getCheckInDeadline, getDateInISOFormat } from '../../utils/ScheduleUtils';
import { ENROLLMENT_STATUSES, HOURS_CONSTS, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  NEW_PARTICIPANTS_COLUMNS,
  PENDING_PARTICIPANTS_COLUMNS,
  TAGS,
  VIOLATIONS_WATCH_COLUMNS,
} from './DashboardConstants';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';

/* constants */
const { DATETIME_RECEIVED, STATUS } = PROPERTY_TYPE_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;
const {
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
} = PEOPLE;

/* styled components */
const DashboardWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  width: ${DASHBOARD_WIDTH};
`;

const DashboardBody = styled.div`
  display: grid;
  grid-gap: 30px 30px;
  grid-template-columns: 1fr 1fr;
  width: 100%;
`;

type Props = {
  actions:{
    getDiversionPlans :RequestSequence;
    goToRoute :RequestSequence;
  };
  app :Map;
  currentDiversionPlansByParticipant :Map;
  enrollmentByParticipant :Map;
  initializeAppRequestState :RequestState;
  getDiversionPlansRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
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
    const { actions, app, participants } = this.props;
    if (app.get(APP.SELECTED_ORG_ID)) {
      actions.getDiversionPlans();
    }
    if (participants.count() > 0) {
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, app, participants } = this.props;
    if (prevProps.app.count() !== app.count()
      || prevProps.app.get(APP.SELECTED_ORG_ID) !== app.get(APP.SELECTED_ORG_ID)) {
      actions.getDiversionPlans();
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

    const { enrollmentByParticipant, participants } = this.props;
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
      .filter((hours :Map) => (hours.get(WORKED) === hours.get(REQUIRED)) && hours.get(REQUIRED) !== 0);

    let pendingCompletionReview :List = List();
    participantsWithHoursComplete.forEach((hours :Map, ekid :UUID) => {

      const participant :Map = participants.find((person :Map) => {
        const personEKID :UUID = getEntityKeyId(person);
        return personEKID === ekid;
      });

      const participantEnrollment = enrollmentByParticipant.get(getEntityKeyId(participant));
      const { [STATUS]: status } = getEntityProperties(participantEnrollment, [STATUS]);
      if (status !== ENROLLMENT_STATUSES.COMPLETED
        && status !== ENROLLMENT_STATUSES.CLOSED
        && status !== ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT
        && status !== ENROLLMENT_STATUSES.SUCCESSFUL) {
        pendingCompletionReview = pendingCompletionReview.push(participant);
      }
    });

    this.setState({
      pendingCompletionReview,
    });
  }

  setParticipantsWithViolations = () => {

    const {
      currentDiversionPlansByParticipant,
      enrollmentByParticipant,
      infractionCountsByParticipant,
      participants,
    } = this.props;

    const violationMap :Map = infractionCountsByParticipant
      .map((count :Map) => count.get(INFRACTIONS_CONSTS.VIOLATION));

    // Get participants with registered violations:
    let violationsWatch :List = participants.filter((participant :Map) => {
      const personEKID :UUID = getEntityKeyId(participant);
      const participantEnrollment = enrollmentByParticipant.get(personEKID);
      const { [STATUS]: status } = getEntityProperties(participantEnrollment, [STATUS]);
      return violationMap.get(personEKID)
        && (status === ENROLLMENT_STATUSES.ACTIVE || status === ENROLLMENT_STATUSES.JOB_SEARCH);
    });
    // Get participants who haven't checked in by their check-in deadline:
    const noShows :List = participants.filter((participant :Map) => {
      const personEKID :UUID = getEntityKeyId(participant);
      const diversionPlan = currentDiversionPlansByParticipant.get(personEKID);
      const { [DATETIME_RECEIVED]: sentenceDate } = getEntityProperties(diversionPlan, [DATETIME_RECEIVED]);

      const checkInDeadline :string = getCheckInDeadline(sentenceDate);
      if (checkInDeadline === EMPTY_FIELD) {
        return false;
      }
      const checkInDeadlineAsISO :string = getDateInISOFormat(checkInDeadline);
      const personStatus :string = enrollmentByParticipant.getIn([personEKID, STATUS, 0]);
      return DateTime.local() > DateTime.fromISO(checkInDeadlineAsISO)
        && personStatus === ENROLLMENT_STATUSES.AWAITING_CHECKIN
        && !violationMap.get(personEKID);
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
      currentDiversionPlansByParticipant,
      getDiversionPlansRequestState,
      initializeAppRequestState,
      hoursWorked,
    } = this.props;
    const {
      newParticipants,
      noShows,
      pendingCompletionReview,
      violationMap,
      violationsWatch,
    } = this.state;

    if (getDiversionPlansRequestState === RequestStates.PENDING
        || initializeAppRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    if (getDiversionPlansRequestState === RequestStates.FAILURE) {
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
              currentDiversionPlansMap={currentDiversionPlansByParticipant}
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              people={newParticipants}
              small
              totalTableItems={newParticipants.count()} />
          <div>
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
                currentDiversionPlansMap={currentDiversionPlansByParticipant}
                handleSelect={this.handleOnSelectPerson}
                hours={hoursWorked}
                people={pendingCompletionReview}
                small
                tag={TAGS.REVIEW}
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
                noShows={noShows}
                people={violationsWatch}
                small
                tag={TAGS.REPORT}
                totalTableItems={violationsWatch.count()}
                violations={violationMap} />
          </div>
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
    [CURRENT_DIVERSION_PLANS_BY_PARTICIPANT]: people.get(CURRENT_DIVERSION_PLANS_BY_PARTICIPANT),
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    getDiversionPlansRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_DIVERSION_PLANS, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getDiversionPlans,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
