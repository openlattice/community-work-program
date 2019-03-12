// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ParticipantsTable from '../../components/table/Table';
import SearchBar from '../../components/search/SearchBar';

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
});

const people = List([
  person,
  anotherPerson,
]).asImmutable();

/*
 * Props
 */

type Props = {
  history :string[],
};

/*
 * React component
 */

class ParticipantsSearchContainer extends Component<Props> {

  handleOnSelectPerson = (person :Map, entityKeyId :string, personId :string) => {
    const { history } = this.props;
    history.push(PARTICIPANT_PROFILE.replace(':subjectId', personId));
  }

  render() {
    return (
      <ParticipantSearchOuterWrapper>
        <SearchBar
            dropdowns={dropdowns} />
        <ParticipantSearchInnerWrapper>
          <ParticipantsHeader>Participants</ParticipantsHeader>
          <ParticipantsTable
              handleSelect={this.handleOnSelectPerson}
              people={people}
              selectedPersonId=""
              small
              totalParticipants={people.count()} />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

export default ParticipantsSearchContainer;
