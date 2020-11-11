/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import toString from 'lodash/toString';
import { faFilter } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Badge,
  Button,
  IconButton,
  Label,
  Select,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { getDiversionPlans } from './ParticipantsActions';
import {
  ALL,
  ALL_PARTICIPANTS_COLUMNS,
  COURT_TYPE_FILTER_OPTIONS,
  EMPTY_FIELD,
  STATUS_FILTER_OPTIONS,
  courtTypeFilterDropdown,
  statusFilterDropdown,
} from './ParticipantsConstants';
import { formatClickedProperty, getFilteredPeople } from './utils/SearchContainerUtils';

import LogoLoader from '../../components/LogoLoader';
import NoParticipantsFound from '../dashboard/NoParticipantsFound';
import ParticipantsTableRow from '../../components/table/ParticipantsTableRow';
import SearchContainer from '../search/SearchContainer';
import TableHeadCell from '../../components/table/TableHeadCell';
import TableHeaderRow from '../../components/table/TableHeaderRow';
import {
  CustomTable,
  TableCard,
  TableCell,
  TableHeader,
  TableName,
} from '../../components/table/styled/index';
import {
  ENROLLMENT_STATUSES,
  HOURS_CONSTS,
  INFRACTIONS_CONSTS
} from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ADD_PARTICIPANT, PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { goToRoute } from '../../core/router/RoutingActions';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { calculateAge, formatAsDate } from '../../utils/DateTimeUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import { isDefined } from '../../utils/LangUtils';
import { getHoursServed, getPersonFullName, getPersonPictureForTable } from '../../utils/PeopleUtils';
import { getSentenceEndDate } from '../../utils/ScheduleUtils';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const {
  COURT_TYPE_BY_PARTICIPANT,
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID,
  PARTICIPANTS,
} = PEOPLE;
const {
  DATETIME_END,
  DATETIME_RECEIVED,
  DOB,
  FIRST_NAME,
  LAST_NAME,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { VIOLATION, WARNING } = INFRACTIONS_CONSTS;
const { REQUIRED, WORKED } = HOURS_CONSTS;

const defaultStatusFilterOption :Map = statusFilterDropdown.get('enums')
  .find((obj) => obj.value.toUpperCase() === ALL);
const defaultCourtTypeFilterOption :Map = courtTypeFilterDropdown.get('enums')
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
`;

const TableHeaderItemsWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const TableHeaderTopRow = styled(TableHeaderItemsWrapper)`
  justify-content: space-between;
`;

const IconButtonWrapper = styled.div`
  margin-right: 10px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 175px);
  grid-gap: 0 10px;
`;

type Props = {
  actions:{
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
  participantPhotosByParticipantEKID :Map;
  participants :List;
};

type State = {
  courtTypeFilterValue :Object;
  filtersVisible :boolean;
  peopleToRender :List;
  statusFilterValue :Object;
};

class ParticipantsSearchContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      courtTypeFilterValue: defaultCourtTypeFilterOption,
      filtersVisible: false,
      peopleToRender: props.participants,
      statusFilterValue: defaultStatusFilterOption,
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
    const { courtTypeFilterValue, statusFilterValue } = this.state;

    const { filter } = clickedProperty;
    const peopleList :List = isDefined(peopleToFilter) ? peopleToFilter : participants;

    const { filteredPeople, newState } = getFilteredPeople(
      filter,
      clickedProperty,
      peopleList,
      courtTypeFilterValue,
      statusFilterValue,
      courtTypeByParticipant,
      enrollmentByParticipant
    );

    this.setState(newState);
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
    const { courtTypeFilterValue, peopleToRender, statusFilterValue } = this.state;

    /* Be sure to search correct participant list — based on filters and whether search input is empty */
    let peopleToFilter :List = peopleToRender;
    if (input === '') {
      if (formatClickedProperty(courtTypeFilterValue) !== ALL || formatClickedProperty(statusFilterValue) !== ALL) {
        peopleToFilter = this.handleOnFilter(statusFilterValue, null, participants);
        peopleToFilter = this.handleOnFilter(courtTypeFilterValue, null, peopleToFilter);
      }
      else {
        peopleToFilter = participants;
      }
    }

    const matches = peopleToFilter.filter((p) => {
      const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(p, [FIRST_NAME, LAST_NAME]);
      const fullName = (`${firstName} ${lastName}`).trim().toLowerCase();
      const reversedFullName = (`${lastName} ${firstName}`).trim().toLowerCase();

      const trimmedInput = input.trim().toLowerCase();
      const match = firstName.toLowerCase().includes(trimmedInput) || lastName.toLowerCase().includes(trimmedInput)
        || fullName.includes(trimmedInput) || reversedFullName.includes(trimmedInput);

      return match;
    });

    this.setState({ peopleToRender: matches });

  }

  aggregateTableData = () => {
    const {
      courtTypeByParticipant,
      currentDiversionPlansByParticipant,
      enrollmentByParticipant,
      hoursWorked,
      infractionCountsByParticipant,
      participantPhotosByParticipantEKID,
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
          [ALL_PARTICIPANTS_COLUMNS[0]]: getPersonPictureForTable(person, true, participantPhotosByParticipantEKID),
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
    const { filtersVisible } = this.state;

    if (getDiversionPlansRequestState === RequestStates.PENDING
        || getInitializeAppRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const tableData :Object[] = this.aggregateTableData();
    const tableHeaders :Object[] = generateTableHeaders(ALL_PARTICIPANTS_COLUMNS);

    return (
      <ParticipantSearchOuterWrapper>
        <ParticipantSearchInnerWrapper>
          <TableCard>
            <TableHeader padding="40px">
              <TableHeaderTopRow>
                <TableHeaderItemsWrapper>
                  <TableName>All Participants</TableName>
                  <Badge mode="primary" count={tableData.length} />
                </TableHeaderItemsWrapper>
                <TableHeaderItemsWrapper>
                  <SearchContainer search={this.searchParticipantList} />
                  <IconButtonWrapper>
                    <IconButton onClick={() => this.setState({ filtersVisible: !filtersVisible })}>
                      <FontAwesomeIcon icon={faFilter} />
                    </IconButton>
                  </IconButtonWrapper>
                  <Button onClick={this.goToAddParticipantForm}>Add</Button>
                </TableHeaderItemsWrapper>
              </TableHeaderTopRow>
              {
                filtersVisible && (
                  <FiltersGrid>
                    <div>
                      <Label>Status</Label>
                      <Select
                          onChange={this.handleOnFilter}
                          options={STATUS_FILTER_OPTIONS}
                          placeholder="All" />
                    </div>
                    <div>
                      <Label>Court Type</Label>
                      <Select
                          onChange={this.handleOnFilter}
                          options={COURT_TYPE_FILTER_OPTIONS}
                          placeholder="All" />
                    </div>
                  </FiltersGrid>
                )
              }
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
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID]: people.get(PARTICIPANT_PHOTOS_BY_PARTICIPANT_EKID),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getDiversionPlansRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_DIVERSION_PLANS, PEOPLE.REQUEST_STATE]),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getDiversionPlans,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsSearchContainer);
