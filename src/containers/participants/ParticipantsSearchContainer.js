// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ParticipantsTable from '../../components/table/Table';

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

/* DUMMY DATA */
const people = List([
  Map(),
  Map(),
]).asImmutable();

type Props = {
};

class ParticipantsSearchContainer extends Component<Props> {
  render() {
    return (
      <ParticipantSearchOuterWrapper>
        <ParticipantSearchInnerWrapper>
          <ParticipantsHeader>Participants</ParticipantsHeader>
          <ParticipantsTable
              people={people}
              totalParticipants={people.count()}
              small />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

export default ParticipantsSearchContainer;
