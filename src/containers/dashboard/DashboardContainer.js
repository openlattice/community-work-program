// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import toString from 'lodash/toString';
import { Badge, CardStack, Tag } from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Element } from 'react';

import LogoLoader from '../../components/LogoLoader';
import NoParticipantsFound from './NoParticipantsFound';
import ParticipantsTableRow from '../../components/table/ParticipantsTableRow';
import TableHeaderRow from '../../components/table/TableHeaderRow';
import TableHeadCell from '../../components/table/TableHeadCell';

import {
  TableCell,
  CustomTable,
  TableCard,
  TableHeader,
  TableName,
} from '../../components/table/styled/index';
import { ErrorMessage } from '../../components/Layout';
import { getDiversionPlans } from '../participants/ParticipantsActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { DASHBOARD_WIDTH } from '../../core/style/Sizes';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { getCheckInDeadline, getDateInISOFormat } from '../../utils/ScheduleUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getPersonFullName, getHoursServed, getPersonPictureForTable } from '../../utils/PeopleUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import { ENROLLMENT_STATUSES, HOURS_CONSTS, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  NEW_PARTICIPANTS_COLUMNS,
  PENDING_PARTICIPANTS_COLUMNS,
  VIOLATIONS_WATCH_COLUMNS,
} from './DashboardConstants';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';
import { OL } from '../../core/style/Colors';
import type { GoToRoute } from '../../core/router/RoutingActions';

/* constants */
const { CHECK_IN_DEADLINE, DATETIME_RECEIVED, STATUS } = PROPERTY_TYPE_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;
const {
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID,
  PARTICIPANTS,
} = PEOPLE;
const { ENTITY_SET_IDS_BY_ORG } = APP;

const tableComponents :Object = {
  Cell: TableCell,
  HeadCell: TableHeadCell,
  Header: TableHeaderRow,
  Row: ParticipantsTableRow
};

/* styled components */
const DashboardWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  width: ${DASHBOARD_WIDTH}px;
`;

const DashboardBody = styled.div`
  display: grid;
  grid-gap: 30px 30px;
  grid-template-columns: 1fr 1fr;
  width: 100%;
`;

const SubtleTag = styled(Tag)`
  background-color: ${OL.WHITE};
  border: 0.5px solid ${OL.GREEN02};
  color: ${OL.GREEN02};
  font-weight: 500;
`;

const ReportTag = styled(SubtleTag)`
  border-color: ${OL.RED01};
  color: ${OL.RED01};
`;

type Props = {
  actions:{
    getDiversionPlans :RequestSequence;
    goToRoute :GoToRoute;
  };
  currentDiversionPlansByParticipant :Map;
  enrollmentByParticipant :Map;
  entitySetIds :Map;
  initializeAppRequestState :RequestState;
  getDiversionPlansRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participantPhotosByParticipantEKID :Map;
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
    const { actions, entitySetIds, participants } = this.props;
    if (entitySetIds.count() > 0) {
      actions.getDiversionPlans();
    }
    if (participants.count() > 0) {
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, entitySetIds, participants } = this.props;
    if (!prevProps.entitySetIds.count() > 0 && entitySetIds.count() > 0) {
      actions.getDiversionPlans();
    }
    if (!prevProps.participants.equals(participants)) {
      this.setParticipantsWithHoursComplete();
      this.setParticipantsWithViolations();
    }
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { actions } = this.props;
    actions.goToRoute(PARTICIPANT_PROFILE.replace(':participantId', personEKID));
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
        && status !== ENROLLMENT_STATUSES.SUCCESSFUL
        && status !== ENROLLMENT_STATUSES.UNSUCCESSFUL) {
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
      const {
        [CHECK_IN_DEADLINE]: checkInDeadlineDateTime,
        [DATETIME_RECEIVED]: sentenceDate,
      } = getEntityProperties(diversionPlan, [CHECK_IN_DEADLINE, DATETIME_RECEIVED]);

      const checkInDeadline :string = getCheckInDeadline(sentenceDate, checkInDeadlineDateTime);
      if (checkInDeadline === EMPTY_FIELD) {
        return false;
      }
      const checkInDeadlineAsISO :string = getDateInISOFormat(checkInDeadline);
      const personStatus :string = enrollmentByParticipant.getIn([personEKID, STATUS, 0]);
      // $FlowFixMe
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

  aggregateNewParticipantsData = () => {
    const {
      currentDiversionPlansByParticipant,
      hoursWorked,
      participantPhotosByParticipantEKID,
    } = this.props;
    const { newParticipants } = this.state;

    const data :Object[] = [];
    if (!newParticipants.isEmpty()) {
      newParticipants.forEach((person :Map) => {

        const personEKID :UUID = getEntityKeyId(person);
        const diversionPlan :Map = currentDiversionPlansByParticipant.get(personEKID);
        const {
          [CHECK_IN_DEADLINE]: checkInDeadlineDateTime,
          [DATETIME_RECEIVED]: sentenceDateTime,
        } = getEntityProperties(diversionPlan, [CHECK_IN_DEADLINE, DATETIME_RECEIVED]);
        const sentenceDate :string = formatAsDate(sentenceDateTime);
        const checkInDeadline :string = getCheckInDeadline(sentenceDateTime, checkInDeadlineDateTime);
        const personHours :Map = hoursWorked.get(personEKID);
        let requiredHours :number | string = personHours.get(REQUIRED, EMPTY_FIELD);
        requiredHours = toString(requiredHours);

        const personRow :Object = {
          [NEW_PARTICIPANTS_COLUMNS[0]]: getPersonPictureForTable(person, true, participantPhotosByParticipantEKID),
          [NEW_PARTICIPANTS_COLUMNS[1]]: getPersonFullName(person),
          [NEW_PARTICIPANTS_COLUMNS[2]]: sentenceDate,
          [NEW_PARTICIPANTS_COLUMNS[3]]: checkInDeadline,
          [NEW_PARTICIPANTS_COLUMNS[4]]: requiredHours,
          id: personEKID,
        };
        data.push(personRow);
      });
    }
    return data;
  }

  aggregatePendingCompletionData = () => {
    const {
      currentDiversionPlansByParticipant,
      hoursWorked,
      participantPhotosByParticipantEKID,
    } = this.props;
    const { pendingCompletionReview } = this.state;

    const data :Object[] = [];
    if (!pendingCompletionReview.isEmpty()) {
      pendingCompletionReview.forEach((person :Map) => {

        const personEKID :UUID = getEntityKeyId(person);
        const diversionPlan :Map = currentDiversionPlansByParticipant.get(personEKID);
        const { [DATETIME_RECEIVED]: sentenceDateTime } = getEntityProperties(diversionPlan, [DATETIME_RECEIVED]);
        const sentenceDate :string = formatAsDate(sentenceDateTime);
        const personHours :Map = hoursWorked.get(personEKID);
        let requiredHours :number | string = personHours.get(REQUIRED, EMPTY_FIELD);
        requiredHours = toString(requiredHours);

        const personRow :Object = {
          [PENDING_PARTICIPANTS_COLUMNS[0]]: getPersonPictureForTable(person, true, participantPhotosByParticipantEKID),
          [PENDING_PARTICIPANTS_COLUMNS[1]]: getPersonFullName(person),
          [PENDING_PARTICIPANTS_COLUMNS[2]]: sentenceDate,
          [PENDING_PARTICIPANTS_COLUMNS[3]]: requiredHours,
          [PENDING_PARTICIPANTS_COLUMNS[4]]: <SubtleTag>Review</SubtleTag>,
          id: personEKID,
        };
        data.push(personRow);
      });
    }
    return data;
  }

  aggregateViolationsWatchData = () => {
    const { hoursWorked, participantPhotosByParticipantEKID } = this.props;
    const { noShows, violationMap, violationsWatch } = this.state;

    const data :Object[] = [];

    if (!violationsWatch.isEmpty()) {
      violationsWatch.forEach((person :Map) => {

        const personEKID :UUID = getEntityKeyId(person);
        const violationsCount = violationMap.get(personEKID, 0);
        const personHours :Map = hoursWorked.get(personEKID);
        const workedHours :number = personHours ? personHours.get(WORKED, undefined) : 0;
        const requiredHours :number = personHours ? personHours.get(REQUIRED, undefined) : 0;
        const hoursServed :string = getHoursServed(workedHours, requiredHours);

        let reportTag :Element<any> | string = '';
        if (noShows.includes(person)) reportTag = <ReportTag>Report</ReportTag>;

        const personRow :Object = {
          [VIOLATIONS_WATCH_COLUMNS[0]]: getPersonPictureForTable(person, true, participantPhotosByParticipantEKID),
          [VIOLATIONS_WATCH_COLUMNS[1]]: getPersonFullName(person),
          [VIOLATIONS_WATCH_COLUMNS[2]]: toString(violationsCount),
          [VIOLATIONS_WATCH_COLUMNS[3]]: hoursServed,
          [VIOLATIONS_WATCH_COLUMNS[4]]: reportTag,
          id: personEKID,
        };
        data.push(personRow);
      });
    }
    return data;
  }

  render() {
    const { getDiversionPlansRequestState, initializeAppRequestState } = this.props;

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

    const newParticipantsTableData = this.aggregateNewParticipantsData();
    const newParticipantsTableHeaders :Object[] = generateTableHeaders(NEW_PARTICIPANTS_COLUMNS);

    const pendingCompletionTableData = this.aggregatePendingCompletionData();
    const pendingCompletionTableHeaders :Object[] = generateTableHeaders(PENDING_PARTICIPANTS_COLUMNS);

    const violationsWatchTableData = this.aggregateViolationsWatchData();
    const violationsWatchTableHeaders :Object[] = generateTableHeaders(VIOLATIONS_WATCH_COLUMNS);

    return (
      <DashboardWrapper>
        <DashboardBody>
          <div>
            <TableCard>
              <TableHeader padding="40px">
                <TableName>
                  New Participants
                </TableName>
                <Badge mode="primary" count={newParticipantsTableData.length} />
              </TableHeader>
              {
                newParticipantsTableData.length > 0
                  ? (
                    <CustomTable
                        components={tableComponents}
                        data={newParticipantsTableData}
                        headers={newParticipantsTableHeaders}
                        isLoading={false} />
                  )
                  : (
                    <NoParticipantsFound text="No new participants at this time." />
                  )
              }
            </TableCard>
          </div>
          <CardStack>
            <TableCard>
              <TableHeader padding="40px">
                <TableName>
                  Pending Completion Review
                </TableName>
                <Badge mode="primary" count={pendingCompletionTableData.length} />
              </TableHeader>
              {
                pendingCompletionTableData.length > 0
                  ? (
                    <CustomTable
                        components={tableComponents}
                        data={pendingCompletionTableData}
                        headers={pendingCompletionTableHeaders}
                        isLoading={false} />
                  )
                  : (
                    <NoParticipantsFound text="No participants pending completion review." />
                  )
              }
            </TableCard>
            <TableCard>
              <TableHeader padding="40px">
                <TableName>
                  Violations Watch
                </TableName>
                <Badge mode="primary" count={violationsWatchTableData.length} />
              </TableHeader>
              {
                violationsWatchTableData.length > 0
                  ? (
                    <CustomTable
                        components={tableComponents}
                        data={violationsWatchTableData}
                        headers={violationsWatchTableHeaders}
                        isLoading={false} />
                  )
                  : (
                    <NoParticipantsFound text="No current participants with violations." />
                  )
              }
            </TableCard>
          </CardStack>
        </DashboardBody>
      </DashboardWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  return {
    [CURRENT_DIVERSION_PLANS_BY_PARTICIPANT]: people.get(CURRENT_DIVERSION_PLANS_BY_PARTICIPANT),
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID]: people.get(PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID),
    entitySetIds: app.get(ENTITY_SET_IDS_BY_ORG, Map()),
    getDiversionPlansRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_DIVERSION_PLANS, PEOPLE.REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
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
