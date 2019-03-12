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
const people = List([
  Map(),
  Map(),
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
              totalParticipants={people.count()}
              small />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

export default ParticipantsSearchContainer;
