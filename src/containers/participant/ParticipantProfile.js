// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import type { RouterHistory } from 'react-router';

import { OL } from '../../core/style/Colors';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { PARTICIPANTS } from '../../core/router/Routes';
import {
  BackNavButton,
} from '../../components/controls/index';
import { getEntityProperties } from '../../utils/DataUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { PARTICIPANT } = PERSON;

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ProfileBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 30px;
`;

const NameRowWrapper = styled.div`
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameHeader = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

type Props = {
  history :RouterHistory;
  personEKID :string;
};

type State = {
};

class ParticipantProfile extends Component<Props, State> {
  render() {
    const { history, participant } = this.props;
    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
      participant, [FIRST_NAME, LAST_NAME]
    );
    return (
      <ProfileWrapper>
        <ProfileBody>
          <BackNavButton
              onClick={() => {
                history.push(PARTICIPANTS);
              }}>
            Back to Participants
          </BackNavButton>
          <NameRowWrapper>
            <NameHeader>{ `${firstName} ${lastName}` }</NameHeader>
          </NameRowWrapper>
        </ProfileBody>
      </ProfileWrapper>
    );
  }
}



