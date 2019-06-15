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

import { ToolBar } from '../../components/controls/index';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { isDefined } from '../../utils/LangUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import {
  ALL,
  ALL_PARTICIPANTS_COLUMNS,
  FILTERS,
  SORTABLE_PARTICIPANT_COLUMNS,
  statusFilterDropdown,
} from '../../utils/constants/UIConsts';
import { PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import { ENROLLMENT_STATUSES, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import {
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  PEOPLE_FQNS,
  SENTENCE_TERM_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';

/*
 * constants
 */
const {
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  SENTENCE_TERMS_BY_PARTICIPANT,
} = PEOPLE;
const { VIOLATION, WARNING } = INFRACTIONS_CONSTS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find(obj => obj.value.toUpperCase() === ALL);

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
  enrollmentByParticipant :Map;
  getSentencesRequestState :RequestState;
  history :RouterHistory,
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
  sentenceTermsByParticipant :Map;
};

type State = {
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
      peopleToRender: props.participants,
      selectedFilterOption: defaultFilterOption,
      selectedSortOption: SORTABLE_PARTICIPANT_COLUMNS.STATUS,
    };
  }

  componentDidMount() {
    this.handleSortOnRender();
  }

  componentDidUpdate(prevProps :Props) {
    const { participants } = this.props;
    if (prevProps.participants.count() !== participants.count()) {
      this.handleSortOnRender();
    }
  }

  handleOnFilter = (clickedProperty :Map, selectEvent :Object, peopleToFilter :List) => {
    const { enrollmentByParticipant, participants } = this.props;
    this.setState({ selectedFilterOption: clickedProperty });

    const peopleList :List = isDefined(peopleToFilter) ? peopleToFilter : participants;
    const filter :string = clickedProperty.filter.toLowerCase();
    let property :string = clickedProperty.label.toUpperCase();
    property = property.split(' ').length > 1 ? property.split(' ').join('_') : property;
    let filteredPeople :List = List();

    if (property === ALL) {
      this.setState({ peopleToRender: participants });
      return peopleList;
    }
    if (filter === FILTERS.STATUS) {
      filteredPeople = peopleList.filter((person :Map) => {
        const statusTypeToInclude = ENROLLMENT_STATUSES[property];
        const { [ENTITY_KEY_ID]: personEKID } :UUID = getEntityProperties(person, [ENTITY_KEY_ID]);
        let { [STATUS]: status } :string = getEntityProperties(enrollmentByParticipant.get(personEKID), [STATUS]);
        status = !isDefined(status) ? ENROLLMENT_STATUSES.AWAITING_ENROLLMENT : status;
        return status === statusTypeToInclude;
      });
    }

    this.setState({ peopleToRender: filteredPeople });
    return filteredPeople;
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { history } = this.props;
    history.push(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  handleOnSort = (clickedColumnHeader :Map, selectEvent :Object, peopleToSort :List) => {
    const { participants } = this.props;
    this.setState({ selectedSortOption: clickedColumnHeader });

    const column = clickedColumnHeader.toLowerCase();
    const peopleList :List = isDefined(peopleToSort) ? peopleToSort : participants;
    let sortedPeople :List = List();

    if (column === SORTABLE_PARTICIPANT_COLUMNS.NAME) {
      sortedPeople = this.sortByName(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.START_DATE) {
      sortedPeople = this.sortByStartDate(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.SENT_END_DATE) {
      sortedPeople = this.sortBySentEndDate(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.STATUS) {
      sortedPeople = this.sortByStatus(peopleList);
    }
    if (Object.values(SORTABLE_PARTICIPANT_COLUMNS).indexOf(column) === -1) {
      // TODO: sort by court type when the data model accomodates court type
      return;
    }

    this.setState({ peopleToRender: sortedPeople });
    return sortedPeople;
  }

  handleSortOnRender = () => {
    const peopleSortedByStatus = this.handleOnSort(SORTABLE_PARTICIPANT_COLUMNS.STATUS.toUpperCase());
    this.setState({
      peopleToRender: peopleSortedByStatus,
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
      const { [FIRST_NAME]: firstNameA, [LAST_NAME]: lastNameA } :string = getEntityProperties(
        personA, [FIRST_NAME, LAST_NAME]
      );
      const { [FIRST_NAME]: firstNameB, [LAST_NAME]: lastNameB } :string = getEntityProperties(
        personB, [FIRST_NAME, LAST_NAME]
      );
      if (lastNameA === lastNameB) {
        return firstNameA.localeCompare(firstNameB, undefined, { sensitivity: 'base' });
      }
      return lastNameA.localeCompare(lastNameB, undefined, { sensitivity: 'base' });
    });
    return sortedByName;
  }

  sortBySentEndDate = (people :List) => {
    const { sentenceTermsByParticipant } = this.props;
    const sortedBySentEndDate :List = people.sort((personA, personB) => {
      const { [ENTITY_KEY_ID]: personAEKID } :UUID = getEntityProperties(personA, [ENTITY_KEY_ID]);
      const { [ENTITY_KEY_ID]: personBEKID } :UUID = getEntityProperties(personB, [ENTITY_KEY_ID]);
      const { [DATETIME_START]: personASentDate } :string = getEntityProperties(
        sentenceTermsByParticipant.get(personAEKID), [DATETIME_START]
      );
      const { [DATETIME_START]: personBSentDate } :string = getEntityProperties(
        sentenceTermsByParticipant.get(personBEKID), [DATETIME_START]
      );
      const sentEndDateA = DateTime.fromISO(personASentDate).plus({ days: 90 });
      const sentEndDateB = DateTime.fromISO(personBSentDate).plus({ days: 90 });
      if (sentEndDateB.isValid && !sentEndDateA.isValid) {
        return -1;
      }
      if (sentEndDateA.isValid && !sentEndDateB.isValid) {
        return 1;
      }
      if ((!sentEndDateA.isValid && !sentEndDateB.isValid) || (+sentEndDateA === +sentEndDateB)) {
        return 0;
      }
      return (sentEndDateA < sentEndDateB) ? 1 : -1;
    });
    return sortedBySentEndDate;
  }

  sortByStartDate = (people :List) => {
    const { enrollmentByParticipant } = this.props;
    const sortedByStartDate :List = people.sort((personA, personB) => {
      const { [ENTITY_KEY_ID]: personAEKID } :UUID = getEntityProperties(personA, [ENTITY_KEY_ID]);
      const { [ENTITY_KEY_ID]: personBEKID } :UUID = getEntityProperties(personB, [ENTITY_KEY_ID]);
      const { [EFFECTIVE_DATE]: personAStartDate } :string = getEntityProperties(
        enrollmentByParticipant.get(personAEKID), [EFFECTIVE_DATE]
      );
      const { [EFFECTIVE_DATE]: personBStartDate } :string = getEntityProperties(
        enrollmentByParticipant.get(personBEKID), [EFFECTIVE_DATE]
      );
      const startDateA = DateTime.fromISO(personAStartDate);
      const startDateB = DateTime.fromISO(personBStartDate);
      if (startDateB.isValid && !startDateA.isValid) {
        return 1;
      }
      if (startDateA.isValid && !startDateB.isValid) {
        return -1;
      }
      if ((!startDateA.isValid && !startDateB.isValid) || (+startDateA === +startDateB)) {
        return 0;
      }
      return (startDateA < startDateB) ? 1 : -1;
    });
    return sortedByStartDate;
  }

  sortByStatus = (people :List) => {
    const { enrollmentByParticipant } = this.props;
    const sortedByStatus :List = people.sort((personA, personB) => {
      const { [ENTITY_KEY_ID]: personAEKID } :UUID = getEntityProperties(personA, [ENTITY_KEY_ID]);
      const { [ENTITY_KEY_ID]: personBEKID } :UUID = getEntityProperties(personB, [ENTITY_KEY_ID]);
      let { [STATUS]: personAStatus } :string = getEntityProperties(
        enrollmentByParticipant.get(personAEKID), [STATUS]
      );
      let { [STATUS]: personBStatus } :string = getEntityProperties(
        enrollmentByParticipant.get(personBEKID), [STATUS]
      );
      personAStatus = !isDefined(personAStatus) ? ENROLLMENT_STATUSES.AWAITING_ENROLLMENT : personAStatus;
      personBStatus = !isDefined(personBStatus) ? ENROLLMENT_STATUSES.AWAITING_ENROLLMENT : personBStatus;
      const statusA :string = personAStatus.split(' ')[0];
      const statusB :string = personBStatus.split(' ')[0];
      return statusA.localeCompare(statusB, undefined, { sensitivity: 'base' });
    });
    return sortedByStatus;
  }

  render() {
    const {
      enrollmentByParticipant,
      getSentencesRequestState,
      hoursWorked,
      infractionCountsByParticipant,
      sentenceTermsByParticipant
    } = this.props;
    const { peopleToRender, selectedSortOption } = this.state;
    const onSelectFunctions = Map().withMutations((map :Map) => {
      map.set('Sort by', this.handleOnSort);
      map.set('Status', this.handleOnFilter);
    });
    const warningMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(`${WARNING}s`));
    const violationMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(`${VIOLATION}s`));
    const extraStyles = {
      align: 'center',
      width: 'inherit'
    };

    if (getSentencesRequestState === RequestStates.PENDING
        || getSentencesRequestState === RequestStates.STANDBY) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    return (
      <ParticipantSearchOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            search={this.searchParticipantList} />
        <ParticipantSearchInnerWrapper>
          <ParticipantsTable
              ageRequired
              alignCenter
              bannerText="All Participants"
              columnHeaders={ALL_PARTICIPANTS_COLUMNS}
              courtType=""
              datesToInclude={{
                deadline: false,
                sentence: true,
                sentenceEnd: true,
                start: true
              }}
              enrollment={enrollmentByParticipant}
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              hoursToInclude={{ requiredHours: true, workedHours: true }}
              people={peopleToRender}
              selectedSortOption={selectedSortOption}
              sentenceTerms={sentenceTermsByParticipant}
              setWidth={false}
              small
              sortByColumn={this.handleOnSort}
              totalTableItems={peopleToRender.count()}
              violations={violationMap}
              warnings={warningMap} />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
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
export default connect(mapStateToProps)(ParticipantsSearchContainer);
