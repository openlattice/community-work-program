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

import { people } from './FakeData';

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
    if (column === 'status') {
      columnToSortBy = 'status';
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
