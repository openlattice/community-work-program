// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import toString from 'lodash/toString';
import { Badge } from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import LogoLoader from '../../components/LogoLoader';
import NoParticipantsFound from '../dashboard/NoParticipantsFound';
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
import { ToolBar } from '../../components/controls/index';
import { getDiversionPlans } from './ParticipantsActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { clearAppointmentsAndPlans } from '../participant/assignedworksites/WorksitePlanActions';
import { ADD_PARTICIPANT, PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { calculateAge, formatAsDate } from '../../utils/DateTimeUtils';
import { getHoursServed, getPersonFullName, getPersonPictureForTable } from '../../utils/PeopleUtils';
import { getSentenceEndDate } from '../../utils/ScheduleUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import {
  ALL,
  ALL_PARTICIPANTS_COLUMNS,
  EMPTY_FIELD,
  FILTERS,
  courtTypeFilterDropdown,
  statusFilterDropdown,
} from './ParticipantsConstants';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  COURT_TYPES_MAP,
  ENROLLMENT_STATUSES,
  HOURS_CONSTS,
  INFRACTIONS_CONSTS
} from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const {
  COURT_TYPE_BY_PARTICIPANT,
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
} = PEOPLE;
const {
  COURT_CASE_TYPE,
  DATETIME_END,
  DATETIME_RECEIVED,
  DOB,
  FIRST_NAME,
  LAST_NAME,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { VIOLATION, WARNING } = INFRACTIONS_CONSTS;
const { REQUIRED, WORKED } = HOURS_CONSTS;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
  list.set(1, courtTypeFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find((obj) => obj.value.toUpperCase() === ALL);


const ParticipantSearchOuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ParticipantSearchInnerWrapper = styled.div`
  align-items: center;
  align-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 30px;
  position: relative;
  width: ${SEARCH_CONTAINER_WIDTH}px;
`;

type Props = {
  actions:{
    clearAppointmentsAndPlans :RequestSequence;
    getDiversionPlans :RequestSequence;
    goToRoute :GoToRoute;
  };
  courtTypeByParticipant :Map;
  currentDiversionPlansByParticipant :Map;
  enrollmentByParticipant :Map;
  entitySetIds :Map;
  getInitializeAppRequestState :RequestState;
  getDiversionPlansRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
};

type State = {
  peopleToRender :List;
  selectedFilterOption :Map;
};

class ParticipantsSearchContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      peopleToRender: props.participants,
      selectedFilterOption: defaultFilterOption,
    };
  }

  componentDidMount() {
    const { actions, entitySetIds } = this.props;
    this.sortParticipantsByStatus();
    if (entitySetIds.has(APP_TYPE_FQNS.PEOPLE)) {
      actions.getDiversionPlans();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { entitySetIds, actions, participants } = this.props;
    if (!prevProps.entitySetIds.equals(entitySetIds)) {
      actions.getDiversionPlans();
    }
    if (!prevProps.participants.equals(participants)) {
      this.sortParticipantsByStatus();
    }
  }

  handleOnFilter = (clickedProperty :Map, selectEvent :Object, peopleToFilter :List) => {
    const { courtTypeByParticipant, enrollmentByParticipant, participants } = this.props;
    const peopleList :List = isDefined(peopleToFilter) ? peopleToFilter : participants;
    const { filter } = clickedProperty;
    let property :string = clickedProperty.label.toUpperCase();
    property = property.split(' ').join('_');
    property = property.split('-').join('');
    let filteredPeople :List = List();

    if (property === ALL) {
      this.setState({ peopleToRender: participants, selectedFilterOption: clickedProperty });
      return peopleList;
    }
    if (filter === FILTERS.STATUS) {
      filteredPeople = peopleList.filter((person :Map) => {
        const statusTypeToInclude = ENROLLMENT_STATUSES[property];
        const personEKID :UUID = getEntityKeyId(person);
        const personEnrollment :Map = enrollmentByParticipant.get(personEKID, Map());
        let { [STATUS]: status } = getEntityProperties(personEnrollment, [STATUS]);
        status = !isDefined(status) ? ENROLLMENT_STATUSES.AWAITING_CHECKIN : status;
        return status === statusTypeToInclude;
      });
    }
    if (filter === FILTERS.COURT_TYPE) {
      filteredPeople = peopleList.filter((person :Map) => {
        const courtTypeToInclude = COURT_TYPES_MAP[property];
        const personEKID :UUID = getEntityKeyId(person);
        const personCourtType :string = courtTypeByParticipant.get(personEKID, '');
        return personCourtType === courtTypeToInclude;
      });
    }

    this.setState({ peopleToRender: filteredPeople, selectedFilterOption: clickedProperty });
    return filteredPeople;
  }

  sortParticipantsByStatus = () => {
    const { enrollmentByParticipant, participants } = this.props;

    const sortedByStatus :List = participants.sort((personA, personB) => {
      const personAEKID :UUID = getEntityKeyId(personA);
      const personBEKID :UUID = getEntityKeyId(personB);
      let { [STATUS]: personAStatus } = getEntityProperties(
        enrollmentByParticipant.get(personAEKID), [STATUS]
      );
      let { [STATUS]: personBStatus } = getEntityProperties(
        enrollmentByParticipant.get(personBEKID), [STATUS]
      );
      personAStatus = !isDefined(personAStatus) ? ENROLLMENT_STATUSES.AWAITING_CHECKIN : personAStatus;
      personBStatus = !isDefined(personBStatus) ? ENROLLMENT_STATUSES.AWAITING_CHECKIN : personBStatus;
      return personAStatus.localeCompare(personBStatus, undefined, { sensitivity: 'base' });
    });

    this.setState({ peopleToRender: sortedByStatus });
  }

  searchParticipantList = (input :string) => {
    const { participants } = this.props;
    const { selectedFilterOption } = this.state;

    const matches = participants.filter((p) => {
      const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(p, [FIRST_NAME, LAST_NAME]);
      const fullName = (`${firstName} ${lastName}`).trim().toLowerCase();

      const trimmedInput = input.trim().toLowerCase();
      const match = firstName.toLowerCase().includes(trimmedInput) || lastName.toLowerCase().includes(trimmedInput)
        || fullName.includes(trimmedInput);

      return match;
    });

    // preserve any filters selected before search
    const fullyProcessedPeople = this.handleOnFilter(selectedFilterOption, null, matches);
    this.setState({ peopleToRender: fullyProcessedPeople });

  }

  aggregateTableData = () => {
    const {
      courtTypeByParticipant,
      currentDiversionPlansByParticipant,
      enrollmentByParticipant,
      hoursWorked,
      infractionCountsByParticipant,
    } = this.props;
    const { peopleToRender } = this.state;

    const data :Object[] = [];
    if (!peopleToRender.isEmpty()) {
      peopleToRender.forEach((person :Map) => {

        const { [DOB]: dateOfBirth } = getEntityProperties(person, [DOB]);
        const personEKID :UUID = getEntityKeyId(person);
        const diversionPlan :Map = currentDiversionPlansByParticipant.get(personEKID);
        const {
          [DATETIME_END]: sentenceEndDateTime,
          [DATETIME_RECEIVED]: sentenceDateTime
        } = getEntityProperties(diversionPlan, [DATETIME_END, DATETIME_RECEIVED]);
        const enrollmentStatus :Map = enrollmentByParticipant.get(personEKID);
        const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
        const warningsCount :number = infractionCountsByParticipant.getIn([personEKID, WARNING], 0);
        const violationsCount :number = infractionCountsByParticipant.getIn([personEKID, VIOLATION], 0);
        const worked :Map = hoursWorked.getIn([personEKID, WORKED], 0);
        const required :number = hoursWorked.getIn([personEKID, REQUIRED], 0);
        const hoursServed :string = getHoursServed(worked, required);

        const personRow :Object = {
          [ALL_PARTICIPANTS_COLUMNS[0]]: getPersonPictureForTable(person, true),
          [ALL_PARTICIPANTS_COLUMNS[1]]: getPersonFullName(person),
          [ALL_PARTICIPANTS_COLUMNS[2]]: toString(calculateAge(dateOfBirth)),
          [ALL_PARTICIPANTS_COLUMNS[3]]: formatAsDate(sentenceDateTime),
          [ALL_PARTICIPANTS_COLUMNS[4]]: getSentenceEndDate(sentenceEndDateTime, sentenceDateTime),
          [ALL_PARTICIPANTS_COLUMNS[5]]: status,
          [ALL_PARTICIPANTS_COLUMNS[6]]: toString(warningsCount),
          [ALL_PARTICIPANTS_COLUMNS[7]]: toString(violationsCount),
          [ALL_PARTICIPANTS_COLUMNS[8]]: hoursServed,
          [ALL_PARTICIPANTS_COLUMNS[9]]: courtTypeByParticipant.get(personEKID) || EMPTY_FIELD,
          id: personEKID,
        };
        data.push(personRow);
      });
    }
    return data;
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { actions } = this.props;
    actions.goToRoute(PARTICIPANT_PROFILE.replace(':participantId', personEKID));
  }

  goToAddParticipantForm = () => {
    const { actions } = this.props;
    actions.goToRoute(ADD_PARTICIPANT);
  }

  render() {
    const { getInitializeAppRequestState, getDiversionPlansRequestState } = this.props;

    if (getDiversionPlansRequestState === RequestStates.PENDING
        || getInitializeAppRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const onSelectFunctions = Map().withMutations((map :Map) => {
      map.set(FILTERS.STATUS, this.handleOnFilter);
      map.set(FILTERS.COURT_TYPE, this.handleOnFilter);
    });
    const tableData :Object[] = this.aggregateTableData();
    const tableHeaders :Object[] = generateTableHeaders(ALL_PARTICIPANTS_COLUMNS);

    return (
      <ParticipantSearchOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            primaryButtonAction={this.goToAddParticipantForm}
            primaryButtonText="Add Participant"
            search={this.searchParticipantList} />
        <ParticipantSearchInnerWrapper>
          <TableCard>
            <TableHeader padding="40px">
              <TableName>
              All Participants
              </TableName>
              <Badge mode="primary" count={tableData.length} />
            </TableHeader>
            {
              tableData.length > 0
                ? (
                  <CustomTable
                      components={{
                        Cell: TableCell,
                        HeadCell: TableHeadCell,
                        Header: TableHeaderRow,
                        Row: ParticipantsTableRow
                      }}
                      data={tableData}
                      headers={tableHeaders}
                      isLoading={false} />
                )
                : (
                  <NoParticipantsFound text="No participants found. Add a new participant and check here again!" />
                )
            }
          </TableCard>
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [COURT_TYPE_BY_PARTICIPANT]: people.get(COURT_TYPE_BY_PARTICIPANT),
    [CURRENT_DIVERSION_PLANS_BY_PARTICIPANT]: people.get(CURRENT_DIVERSION_PLANS_BY_PARTICIPANT),
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    getDiversionPlansRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_DIVERSION_PLANS, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearAppointmentsAndPlans,
    getDiversionPlans,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsSearchContainer);
