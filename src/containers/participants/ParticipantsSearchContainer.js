// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';
import type { RouterHistory } from 'react-router';

import ParticipantsTable from '../../components/table/ParticipantsTable';
import LogoLoader from '../../components/LogoLoader';

import { ToolBar } from '../../components/controls/index';
import { sortDropdown, statusFilterDropdown } from './ParticipantsConstants';
import { isDefined } from '../../utils/LangUtils';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { allParticipantsColumns } from '../../utils/constants/UIConsts';
import { PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
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

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, sortDropdown);
  list.set(1, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums').find(option => option.get('default'));
const defaultSortOption :Map = sortDropdown.get('enums').find(option => option.get('default'));

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
      selectedSortOption: defaultSortOption,
    };
  }

  componentDidMount() {
    const sortedByDefault = this.handleOnSort(defaultSortOption);
    this.setState({
      peopleToRender: sortedByDefault,
    });
  }

  componentDidUpdate(prevProps :Props) {
    const { participants } = this.props;
    if (prevProps.participants.count() !== participants.count()) {
      this.setState({
        peopleToRender: participants,
      });
    }
  }

  handleOnFilter = (clickedProperty :Map, peopleToFilter :List) => {
    const { participants } = this.props;
    this.setState({ selectedFilterOption: clickedProperty });

    const peopleList :List = isDefined(peopleToFilter) ? peopleToFilter : participants;
    const filter :string = clickedProperty.get('filter').toLowerCase(); // dropdown/property name
    const property :string = clickedProperty.get('label').toLowerCase(); // value

    if (property === 'all') {
      this.setState({ peopleToRender: participants });
      return peopleList;
    }

    const filteredPeople = peopleList.filter((participant :Map) => (
      participant.get(filter).toLowerCase() === property.toLowerCase()
    ));

    this.setState({ peopleToRender: filteredPeople });
    return filteredPeople;
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { history } = this.props;
    history.push(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  handleOnSort = (clickedColumnHeader :Map, peopleToSort :List) => {
    const { participants } = this.props;
    this.setState({ selectedSortOption: clickedColumnHeader });

    const column = clickedColumnHeader.get('label').toLowerCase();
    let columnToSortBy = '';
    if (column === 'start date') {
      columnToSortBy = 'startDate';
    }
    if (column === 'sent. end date') {
      columnToSortBy = 'sentenceEndDate';
    }
    if (column === 'name') {
      columnToSortBy = 'name';
    }
    if (column === 'status') {
      columnToSortBy = 'status';
    }
    if (column === 'court type') {
      columnToSortBy = 'typeOfCourt';
    }
    const peopleList :List = isDefined(peopleToSort) ? peopleToSort : participants;
    const sortedData = peopleList.sort((a, b) => {
      const valueA = a.get(columnToSortBy);
      const valueB = b.get(columnToSortBy);
      if (!isDefined(valueA)) {
        return -1;
      }
      if (!isDefined(valueB)) {
        return 1;
      }
      if (!isDefined(valueA) && !isDefined(valueB)) {
        return 0;
      }
      if (valueA === valueB) {
        return 0;
      }
      if (columnToSortBy === 'name') {
        const valueASplit = valueA.split(' ');
        const valueBSplit = valueB.split(' ');
        return valueASplit[valueASplit.length - 1]
          .localeCompare(valueBSplit[valueBSplit.length - 1], undefined, { sensitivity: 'base' });
      }
      return valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' });
    });

    this.setState({ peopleToRender: sortedData });
    return sortedData;
  }

  searchParticipantList = (input :string) => {
    const { participants } = this.props;
    const { selectedFilterOption, selectedSortOption } = this.state;
    const matches = participants.filter((p) => {
      const fullName = p.get('name').trim().toLowerCase();
      const firstName = p.get('name').split(' ')[0].trim().toLowerCase();
      const lastName = p.get('name').split(' ')[1].trim().toLowerCase();
      const trimmedInput = input.trim().toLowerCase();

      const match = firstName.includes(trimmedInput) || lastName.includes(trimmedInput)
        || fullName.includes(trimmedInput);

      return match;
    });
    const sortedSearchedPeople = this.handleOnSort(selectedSortOption, matches);
    const sortedSearchedFilteredPeople = this.handleOnFilter(selectedFilterOption, sortedSearchedPeople);
    this.setState({ peopleToRender: sortedSearchedFilteredPeople });

  }

  render() {
    const {
      enrollmentByParticipant,
      getSentencesRequestState,
      hoursWorked,
      infractionCountsByParticipant,
      sentenceTermsByParticipant
    } = this.props;
    const { peopleToRender } = this.state;
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
              bannerText="All Participants"
              columnHeaders={allParticipantsColumns}
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
              sentenceTerms={sentenceTermsByParticipant}
              small
              styles={extraStyles}
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
