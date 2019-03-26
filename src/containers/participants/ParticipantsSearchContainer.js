// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ParticipantsTable from '../../components/table/ParticipantsTable';

import { ToolBar } from '../../components/controls/index';
import { sortDropdown } from './ParticipantsConstants';
import { isDefined } from '../../utils/LangUtils';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { OL } from '../../utils/constants/Colors';
import {
  APP_CONTENT_PADDING,
  SEARCH_CONTAINER_WIDTH,
} from '../../core/style/Sizes';

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
  flex-direction: column;
  padding: ${APP_CONTENT_PADDING}px;
  margin-top: 30px;
  width: ${SEARCH_CONTAINER_WIDTH}px;
  position: relative;
  align-self: center;
`;

const ParticipantsHeader = styled.div`
  padding: 0 0 40px 0;
  font-size: 30px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

/*
 * constants
 */

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, sortDropdown);
});

/* DUMMY DATA */
const person = Map().withMutations((map :Map) => {
  map.set('name', 'Tommy Morrison');
  map.set('age', 25);
  map.set('startDate', '08/02/2018');
  map.set('sentenceDate', '08/09/2018');
  map.set('sentenceEndDate', '11/10/2018');
  map.set('hoursServed', '62h / 100h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('status', 'Active');
});

const anotherPerson = Map().withMutations((map :Map) => {
  map.set('name', 'Mabel Garrett');
  map.set('age', 19);
  map.set('startDate', '08/02/2018');
  map.set('sentenceDate', '08/06/2018');
  map.set('sentenceEndDate', '12/31/2018');
  map.set('hoursServed', '100h / 100h');
  map.set('numberOfWarnings', 1);
  map.set('numberOfViolations', 0);
  map.set('status', 'Completed');
});

const someone = Map().withMutations((map :Map) => {
  map.set('name', 'Phoebe Oates');
  map.set('age', 28);
  map.set('startDate', '06/02/2018');
  map.set('sentenceDate', '06/06/2018');
  map.set('sentenceEndDate', '12/31/2018');
  map.set('hoursServed', '5h / 25h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 1);
  map.set('status', 'Noncompliant - active');
});

const someoneElse = Map().withMutations((map :Map) => {
  map.set('name', 'Frank Seebold');
  map.set('age', 34);
  map.set('startDate', '01/02/2018');
  map.set('sentenceDate', '01/06/2018');
  map.set('sentenceEndDate', '10/08/2018');
  map.set('hoursServed', '53h / 150h');
  map.set('numberOfWarnings', 2);
  map.set('numberOfViolations', 0);
  map.set('status', 'Closed');
});

const human = Map().withMutations((map :Map) => {
  map.set('name', 'Lori Amaratti');
  map.set('age', 21);
  map.set('startDate', '');
  map.set('sentenceDate', '09/01/2018');
  map.set('sentenceEndDate', '10/08/2018');
  map.set('hoursServed', '0h / 50h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('status', 'Awaiting enrollment');
});

const anotherHuman = Map().withMutations((map :Map) => {
  map.set('name', 'Heather Everett');
  map.set('age', 23);
  map.set('startDate', '09/04/2018');
  map.set('sentenceDate', '09/01/2018');
  map.set('sentenceEndDate', '12/08/2018');
  map.set('hoursServed', '15h / 50h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 2);
  map.set('status', 'Noncompliant - removed');
});

const people = List([
  person,
  anotherPerson,
  someone,
  someoneElse,
  human,
  anotherHuman,
]).asImmutable();

const defaultSortOption :Map = sortDropdown.get('enums').find(option => option.get('default'));

/*
 * Props
 */

type Props = {
  history :string[],
};

type State = {
  peopleToRender :List;
  selectedSortOption :Map;
};

/*
 * React component
 */

class ParticipantsSearchContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      peopleToRender: people,
      selectedSortOption: defaultSortOption,
    };
  }

  componentDidMount() {
    const sortedByDefault = this.handleOnSort(defaultSortOption);
    this.setState({
      peopleToRender: sortedByDefault,
    });
  }

  handleOnSelectPerson = (person :Map, entityKeyId :string, personId :string) => {
    const { history } = this.props;
    history.push(PARTICIPANT_PROFILE.replace(':subjectId', personId));
  }

  handleOnSort = (clickedColumnHeader :Map, peopleToSort :List) => {
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
    const participants :List = isDefined(peopleToSort) ? peopleToSort : people;
    const sortedData = participants.sort((a, b) => {
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
    const { selectedSortOption } = this.state;
    const matches = people.filter((p) => {
      const fullName = p.get('name').trim().toLowerCase();
      const firstName = p.get('name').split(' ')[0].trim().toLowerCase();
      const lastName = p.get('name').split(' ')[1].trim().toLowerCase();
      const trimmedInput = input.trim().toLowerCase();

      const match = firstName.includes(trimmedInput) || lastName.includes(trimmedInput)
        || fullName.includes(trimmedInput);

      return match;
    });
    const sortedFilteredPeople = this.handleOnSort(selectedSortOption, matches);
    this.setState({ peopleToRender: sortedFilteredPeople });

  }

  render() {
    const { peopleToRender } = this.state;
    const onSelectFunctions = Map().withMutations((map :Map) => {
      map.set('Sort by', this.handleOnSort);
    });
    return (
      <ParticipantSearchOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            search={this.searchParticipantList} />
        <ParticipantSearchInnerWrapper>
          <ParticipantsHeader>Participants</ParticipantsHeader>
          <ParticipantsTable
              handleSelect={this.handleOnSelectPerson}
              people={peopleToRender}
              selectedPersonId=""
              small
              totalParticipants={people.count()} />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

export default ParticipantsSearchContainer;
