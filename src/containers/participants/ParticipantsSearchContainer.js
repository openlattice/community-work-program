// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import type { RouterHistory } from 'react-router';

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

import {
  people,
  contactInfo,
} from './FakeData';

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
 * Props and State
 */

type Props = {
  history :RouterHistory,
  selectPerson :(selectedPerson :Map) => void;
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
        // NOTE: this sorts alphabetically by last name
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
    const { selectPerson } = this.props;
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
              contactInfo={contactInfo}
              handleSelect={this.handleOnSelectPerson}
              people={peopleToRender}
              selectPerson={selectPerson}
              selectedPersonId=""
              small={false}
              totalParticipants={people.count()} />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

export default withRouter(ParticipantsSearchContainer);
