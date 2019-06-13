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
  PrimaryButton,
} from '../../components/controls/index';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

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

const BasicInfoWrapper = styled.div`
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const InnerColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const InnerRowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ModalBodyWrapper = styled.div`
  width: 400px;
  height: 110px;
  display: grid;
`;

const ActionWrapper = styled.div`
  position: fixed;
  width: 400px;
  margin-top: 85px;
  margin-bottom: 20px;
  z-index: 200;
`;

const ModalText = styled.div`
  font-size: 14px;
  color: ${OL.GREY02};
  margin: 5px 0;
  display: block;
`;

type Props = {
  history :RouterHistory;
  person :Map;
};

type State = {
};
// eslint-disable-next-line react/prefer-stateless-function
class ParticipantProfile extends Component<Props, State> {
  render() {
    const { history, person } = this.props;
    console.log('person: ', person);
    return (
      <ProfileWrapper>
        <ProfileBody>
          <BackNavButton
              onClick={() => {
                history.push(PARTICIPANTS);
              }}>
            Back to Participants
          </BackNavButton>
        </ProfileBody>
      </ProfileWrapper>
    );
  }
}

// <NameRowWrapper>
//   <NameHeader>{ `${person.getIn([FIRST_NAME, 0])} ${person.getIn([LAST_NAME, 0])}` }</NameHeader>
// </NameRowWrapper>

// <PrimaryButton>
//   {buttonText}
// </PrimaryButton>


// <BasicInfoWrapper>
//   <GeneralInfo person={person} />
//   <InnerColumnWrapper>
//     <KeyDates
//         person={person} />
//     <InnerRowWrapper>
//       <CaseInfo />
//       <ViolationsDisplay />
//     </InnerRowWrapper>
//   </InnerColumnWrapper>
// </BasicInfoWrapper>
export default ParticipantProfile;
