// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import type { RouterHistory } from 'react-router';

import ParticipantsTable from '../../components/table/ParticipantsTable';
import ToolBar from '../../components/controls/ToolBar';
import { sortDropdown } from './ParticipantsConstants';
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
const somePerson = Map().withMutations((map :Map) => {
  map.set('name', 'Tommy Morrison');
  map.set('age', 25);
  map.set('startDate', '08/02/2018');
  map.set('sentenceDate', '08/09/2018');
  map.set('sentenceEndDate', '11/10/2018');
  map.set('hoursServed', '62h / 100h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', '12gsdaru23hg0sei420');
});

const anotherPerson = Map().withMutations((map :Map) => {
  map.set('name', 'Mabel Garrett');
  map.set('age', 19);
  map.set('startDate', '08/02/2018');
  map.set('sentenceDate', '08/06/2018');
  map.set('sentenceEndDate', '12/31/2018');
  map.set('hoursServed', '24h / 100h');
  map.set('numberOfWarnings', 1);
  map.set('numberOfViolations', 0);
  map.set('personId', 'dgal9827423bksdafgf');
});

const people = List([
  somePerson,
  anotherPerson,
]).asImmutable();

/*
 * Props
 */

type Props = {
  history :RouterHistory,
};

type State = {
  searchedPeople :List;
};

/*
 * React component
 */

class ParticipantsSearchContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      searchedPeople: List(),
    };
  }

  handleOnSelectPerson = (person :Map, entityKeyId :string, personId :string) => {
    const { history } = this.props;
    history.push(PARTICIPANT_PROFILE.replace(':subjectId', personId));
  }

  searchParticipantList = (input :string) => {
    const matches = people.filter((p) => {
      const fullName = p.get('name').trim().toLowerCase();
      const firstName = p.get('name').split(' ')[0].trim().toLowerCase();
      const lastName = p.get('name').split(' ')[1].trim().toLowerCase();
      const trimmedInput = input.trim().toLowerCase();

      const match = firstName.includes(trimmedInput) || lastName.includes(trimmedInput)
        || fullName.includes(trimmedInput);

      return match;
    });

    this.setState({ searchedPeople: matches });

  }

  render() {
    const { searchedPeople } = this.state;
    const peopleToRender = searchedPeople.count() === 0 ? people : searchedPeople;
    return (
      <ParticipantSearchOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
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

export default withRouter(ParticipantsSearchContainer);
