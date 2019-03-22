// @flow
import React from 'react';
import styled from 'styled-components';
import type { RouterHistory } from 'react-router';

import GeneralInfo from '../../components/participant/GeneralInfo';
import KeyDates from '../../components/participant/KeyDates';
import CaseInfo from '../../components/participant/CaseInfo';
import ViolationsDisplay from '../../components/participant/ViolationsDisplay';
import * as Routes from '../../core/router/Routes';

import { BackNavButton, PrimaryButton, SecondaryButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { OL } from '../../utils/constants/Colors';

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
  margin: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameHeader = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

const StyledPrimaryButton = styled(PrimaryButton)`
  padding: 8px 30px;
  font-weight: 500;
  font-spacing: 2px;
`;

const RowWrapper = styled.div`
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

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

type Props = {
  history :RouterHistory;
};

const ParticipantProfile = ({ history } :Props) => (
  <ProfileWrapper>
    <ProfileBody>
      <BackNavButton
          onClick={() => {
            history.push(Routes.DASHBOARD);
          }}>
        Back to Dashboard
      </BackNavButton>
      <NameRowWrapper>
        <NameHeader>Alex Burgess</NameHeader>
        <PrimaryButton>Start Program</PrimaryButton>
      </NameRowWrapper>
      <RowWrapper>
        <GeneralInfo />
        <InnerColumnWrapper>
          <KeyDates />
          <InnerRowWrapper>
            <CaseInfo />
            <ViolationsDisplay />
          </InnerRowWrapper>
        </InnerColumnWrapper>
      </RowWrapper>
    </ProfileBody>
    <ProfileBody>
      <NameRowWrapper>
        <NameHeader>Work Schedule</NameHeader>
        <ButtonWrapper>
          <SecondaryButton>Print Schedule</SecondaryButton>
          <PrimaryButton>Create Appointment</PrimaryButton>
        </ButtonWrapper>
      </NameRowWrapper>
    </ProfileBody>
  </ProfileWrapper>
);

export default ParticipantProfile;
