// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import ParticipantsTable from '../../components/table/Table';

import { OL } from '../../utils/constants/Colors';

const ParticipantSearchOuterWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
`;

const ParticipantSearchInnerWrapper = styled.div`
  margin-top: 30px;
  width: 1080px;
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
