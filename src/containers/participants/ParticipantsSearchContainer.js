// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

const ParticipantSearchOuterWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
`;

const ParticipantSearchInnerWrapper = styled.div`
  margin-top: 30px;
  width: 990px;
`;

class ParticipantsSearchContainer extends Component {
  render() {
    return (
      <ParticipantSearchOuterWrapper>
        <ParticipantSearchInnerWrapper />
      </ParticipantSearchOuterWrapper>
    );
  }
}

export default ParticipantsSearchContainer;
