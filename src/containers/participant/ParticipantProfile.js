// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import type { RouterHistory } from 'react-router';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import GeneralInfo from '../../components/participant/GeneralInfo';
import KeyDates from '../../components/participant/KeyDates';
import CaseInfo from '../../components/participant/CaseInfo';
import ViolationsDisplay from '../../components/participant/ViolationsDisplay';
import * as Routes from '../../core/router/Routes';

import { BackNavButton, PrimaryButton, SecondaryButton } from '../../components/controls/index';
import {
  BackNavButton,
  PrimaryButton,
  TertiaryButton,
} from '../../components/controls/index';
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

const CalendarWrapper = styled.div`
  display: flex;
  height: 600px;
  width: 100%;
  border: 1px solid ${OL.GREY08};
  border-radius: 5px;
  margin: 15px 0;
  background-color: ${OL.WHITE};
`;

const localizer = BigCalendar.momentLocalizer(moment);

/* Fake Data */
const myEvents :Object[] = [
  {
    title: 'Work Assignment',
    start: new Date(2019, 3, 1),
    end: new Date(2019, 3, 1),
    resourceId: 'resource1',
    id: 1,
  },
];
const eventResources :Object[] = [
  {
    resourceId: 'resource1',
    resourceTitle: 'Pennington County',
  },
];

type Props = {
  contactInfo :Map;
  history :RouterHistory;
  person :Map;
};

const ParticipantProfile = ({ contactInfo, history, person } :Props) => (
  <ProfileWrapper>
    <ProfileBody>
      <BackNavButton
          onClick={() => {
            history.push(Routes.DASHBOARD);
          }}>
        Back to Dashboard
      </BackNavButton>
      <NameRowWrapper>
        <NameHeader>{person.get('name')}</NameHeader>
        <PrimaryButton>Start Program</PrimaryButton>
      </NameRowWrapper>
      <RowWrapper>
        <GeneralInfo
            contactInfo={contactInfo}
            person={person} />
        <InnerColumnWrapper>
          <KeyDates
              person={person} />
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
      <CalendarWrapper />
      <CalendarWrapper>
        <BigCalendar
            localizer={localizer}
            events={myEvents}
            defaultDate={new Date()}
            resources={eventResources}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle" />
      </CalendarWrapper>
    </ProfileBody>
    <ProfileBody>
      <NameRowWrapper>
        <NameHeader>Warnings & Violations</NameHeader>
        <ButtonWrapper>
          <PrimaryButton>Report Warning or Violation</PrimaryButton>
        </ButtonWrapper>
      </NameRowWrapper>
    </ProfileBody>
  </ProfileWrapper>
);
              <TertiaryButton>Print Schedule</TertiaryButton>
              <TertiaryButton>Create Appointment</TertiaryButton>
              <TertiaryButton>Report Warning or Violation</TertiaryButton>

export default ParticipantProfile;
