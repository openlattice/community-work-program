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
import AddParticipantModal from './AddParticipantModal';
import LogoLoader from '../../components/LogoLoader';

import { ToolBar } from '../../components/controls/index';
import { getDiversionPlans } from './ParticipantsActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  ALL,
  ALL_PARTICIPANTS_COLUMNS,
  FILTERS,
  SORTABLE_PARTICIPANT_COLUMNS,
  statusFilterDropdown,
} from './ParticipantsConstants';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import { ENROLLMENT_STATUSES, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

/*
 * constants
 */
const {
  COURT_TYPE_BY_PARTICIPANT,
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT,
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
} = PEOPLE;
const {
  DATETIME_RECEIVED,
  FIRST_NAME,
  LAST_NAME,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { VIOLATION, WARNING } = INFRACTIONS_CONSTS;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find((obj) => obj.value.toUpperCase() === ALL);

/*
 * styled components
 */

const ParticipantSearchOuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const ParticipantSearchInnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;
  min-width: ${SEARCH_CONTAINER_WIDTH}px;
  position: relative;
  align-self: center;
`;

/*
 * Props
 */

type Props = {
  actions:{
    getDiversionPlans :RequestSequence;
    goToRoute :RequestSequence;
  };
  app :Map;
  courtTypeByParticipant :Map;
  currentDiversionPlansByParticipant :Map;
  enrollmentByParticipant :Map;
  getInitializeAppRequestState :RequestState;
  getDiversionPlansRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
};

type State = {
  showAddParticipant :boolean;
  peopleToRender :List;
  selectedFilterOption :Map;
  selectedSortOption :Map;
};

/*
 * React component
 */

class ParticipantsSearchContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      showAddParticipant: false,
      peopleToRender: props.participants,
      selectedFilterOption: defaultFilterOption,
      selectedSortOption: SORTABLE_PARTICIPANT_COLUMNS.STATUS,
    };
  }

  componentDidMount() {
    const { actions, app } = this.props;
    this.handleOnSort(SORTABLE_PARTICIPANT_COLUMNS.STATUS.toUpperCase());
    if (app.get(APP_TYPE_FQNS.PEOPLE)) {
      actions.getDiversionPlans();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { app, actions, participants } = this.props;
    if (prevProps.app.count() !== app.count()) {
      actions.getDiversionPlans();
    }
    if (prevProps.participants.count() !== participants.count()) {
      this.handleOnSort(SORTABLE_PARTICIPANT_COLUMNS.STATUS.toUpperCase());
    }
  }

  handleOnFilter = (clickedProperty :Map, selectEvent :Object, peopleToFilter :List) => {
    const { enrollmentByParticipant, participants } = this.props;
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

    this.setState({ peopleToRender: filteredPeople, selectedFilterOption: clickedProperty });
    return filteredPeople;
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { actions } = this.props;
    actions.goToRoute(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  handleOnSort = (clickedColumnHeader :Map, selectEvent :Object, peopleToSort :List) => {
    const { participants } = this.props;
    const column = clickedColumnHeader.toLowerCase();
    const peopleList :List = isDefined(peopleToSort) ? peopleToSort : participants;
    let sortedPeople :List = List();

    if (column === SORTABLE_PARTICIPANT_COLUMNS.NAME) {
      sortedPeople = this.sortByName(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.SENT_END_DATE) {
      sortedPeople = this.sortBySentenceEndDate(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.STATUS) {
      sortedPeople = this.sortByStatus(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.COURT_TYPE) {
      sortedPeople = this.sortByCourtType(peopleList);
    }
    if (Object.values(SORTABLE_PARTICIPANT_COLUMNS).indexOf(column) === -1) {
      return;
    }

    this.setState({ peopleToRender: sortedPeople, selectedSortOption: clickedColumnHeader });
    return sortedPeople;
  }

  handleShowAddParticipant = () => {
    this.setState({
      showAddParticipant: true
    });
  }

  handleHideAddParticipant = () => {
    this.setState({
      showAddParticipant: false
    });
  }

  searchParticipantList = (input :string) => {
    const { participants } = this.props;
    const { selectedFilterOption, selectedSortOption } = this.state;

    const matches = participants.filter((p) => {
      const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(p, [FIRST_NAME, LAST_NAME]);
      const fullName = (`${firstName} ${lastName}`).trim().toLowerCase();

      const trimmedInput = input.trim().toLowerCase();
      const match = firstName.toLowerCase().includes(trimmedInput) || lastName.toLowerCase().includes(trimmedInput)
        || fullName.includes(trimmedInput);

      return match;
    });

    // preserve any filters or sorting that was selected before search
    const sortedSearchedPeople = this.handleOnSort(selectedSortOption, null, matches);
    const fullyProcessedPeople = this.handleOnFilter(selectedFilterOption, null, sortedSearchedPeople);
    this.setState({ peopleToRender: fullyProcessedPeople });

  }

  sortByName = (people :List) => {
    const sortedByName :List = people.sort((personA, personB) => {
      const { [FIRST_NAME]: firstNameA, [LAST_NAME]: lastNameA } = getEntityProperties(
        personA, [FIRST_NAME, LAST_NAME]
      );
      const { [FIRST_NAME]: firstNameB, [LAST_NAME]: lastNameB } = getEntityProperties(
        personB, [FIRST_NAME, LAST_NAME]
      );
      if (lastNameA === lastNameB) {
        return firstNameA.localeCompare(firstNameB, undefined, { sensitivity: 'base' });
      }
      return lastNameA.localeCompare(lastNameB, undefined, { sensitivity: 'base' });
    });
    return sortedByName;
  }

  sortBySentenceEndDate = (people :List) => {
    const { currentDiversionPlansByParticipant } = this.props;

    const sortedBySentEndDate = people.sortBy((person :Map) => {
      const personEKID :UUID = getEntityKeyId(person);
      const time = DateTime.fromISO(currentDiversionPlansByParticipant.getIn([personEKID, DATETIME_RECEIVED, 0]));
      return time.valueOf();
    });
    return sortedBySentEndDate;
  }

  sortByStatus = (people :List) => {
    const { enrollmentByParticipant } = this.props;
    const sortedByStatus :List = people.sort((personA, personB) => {
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
    return sortedByStatus;
  }

  sortByCourtType = (people :List) => {
    const { courtTypeByParticipant } = this.props;

    const sortedByCourtType :List = people.sort((personA, personB) => {
      const personAEKID :UUID = getEntityKeyId(personA);
      const personBEKID :UUID = getEntityKeyId(personB);
      const courtTypeA :string = courtTypeByParticipant.get(personAEKID) || '';
      const courtTypeB :string = courtTypeByParticipant.get(personBEKID) || '';
      return courtTypeA.localeCompare(courtTypeB, undefined, { sensitivity: 'base' });
    });
    return sortedByCourtType;
  }

  render() {
    const {
      courtTypeByParticipant,
      currentDiversionPlansByParticipant,
      enrollmentByParticipant,
      getInitializeAppRequestState,
      getDiversionPlansRequestState,
      hoursWorked,
      infractionCountsByParticipant,
    } = this.props;
    const { showAddParticipant, peopleToRender, selectedSortOption } = this.state;

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
    });
    const warningMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(WARNING));
    const violationMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(VIOLATION));

    return (
      <ParticipantSearchOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            primaryButtonAction={this.handleShowAddParticipant}
            primaryButtonText="Add Participant"
            search={this.searchParticipantList} />
        <ParticipantSearchInnerWrapper>
          <ParticipantsTable
              ageRequired
              alignCenter
              bannerText="All Participants"
              columnHeaders={ALL_PARTICIPANTS_COLUMNS}
              config={{
                includeDeadline: false,
                includeRequiredHours: true,
                includeSentenceDate: true,
                includeSentenceEndDate: true,
                includeStartDate: false,
                includeWorkedHours: true
              }}
              courtTypeByParticipant={courtTypeByParticipant}
              currentDiversionPlansMap={currentDiversionPlansByParticipant}
              enrollment={enrollmentByParticipant}
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              people={peopleToRender}
              selectedSortOption={selectedSortOption}
              small
              sortByColumn={this.handleOnSort}
              totalTableItems={peopleToRender.count()}
              violations={violationMap}
              warnings={warningMap}
              width="100%" />
        </ParticipantSearchInnerWrapper>
        <AddParticipantModal
            isOpen={showAddParticipant}
            onClose={this.handleHideAddParticipant} />
      </ParticipantSearchOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  return {
    app,
    [COURT_TYPE_BY_PARTICIPANT]: people.get(COURT_TYPE_BY_PARTICIPANT),
    [CURRENT_DIVERSION_PLANS_BY_PARTICIPANT]: people.get(CURRENT_DIVERSION_PLANS_BY_PARTICIPANT),
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    getDiversionPlansRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_DIVERSION_PLANS, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
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
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsSearchContainer);
