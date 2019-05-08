// @flow
import React from 'react';
import styled from 'styled-components';
import type { RouterHistory } from 'react-router';

import contactIcon from '../../assets/svg/contact.svg';
import clockIcon from '../../assets/svg/clock.svg';

import * as Routes from '../../core/router/Routes';
import {
  ContainerOuterWrapper,
  ContainerInnerWrapper,
  HeaderWrapperWithButtons,
  ContainerHeader,
  ButtonWrapper,
  SubtitleWrapper,
  Subtitle,
  Status,
  SmallSeparator,
  CardOuterWrapper,
  CardInnerWrapper,
  CardInnerText,
  InnerSectionWrapper,
  Section,
  SectionHeaderWrapper,
  SectionHeader,
  BodyTextSegment,
  BodyTextHeader,
  BodyText,
} from '../../components/Layout';
import { BackNavButton, PrimaryButton, TertiaryButton } from '../../components/controls/index';
import { OL } from '../../core/style/Colors';

// import { worksites } from '../worksites/FakeData';

type Props = {
  history :RouterHistory;
};

const OrganizationCard = styled(CardOuterWrapper)`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
`;

const OrganizationCardInnerWrapper = styled(CardInnerWrapper)`
  border-bottom: 1px solid ${OL.GREY11};
  margin: 0;
`;

const OrganizationSectionText = styled(CardInnerWrapper)`
  margin: 0 0 0 50px;
  justify-content: space-between;
  align-items: space-between;
  height: 100%;
`;

const SectionBlockWrapper = styled.div`
  display: flex;
`;

/* eslint-disable max-len */
const WorksiteContainer = ({ history } :Props) => (
  <ContainerOuterWrapper>
    <ContainerInnerWrapper style={{ padding: '0' }}>
      <BackNavButton
          onClick={() => {
            history.push(Routes.WORKSITES);
          }}>
        Back to Organizations
      </BackNavButton>
      <HeaderWrapperWithButtons>
        <ContainerHeader>Community Garden</ContainerHeader>
        <ButtonWrapper>
          <TertiaryButton>Edit Info</TertiaryButton>
          <PrimaryButton>Change Status</PrimaryButton>
        </ButtonWrapper>
      </HeaderWrapperWithButtons>
      <SubtitleWrapper>
        <Subtitle style={{ fontSize: '18px' }}>8 scheduled</Subtitle>
        <SmallSeparator>•</SmallSeparator>
        <Subtitle style={{ fontSize: '18px' }}>76 total</Subtitle>
        <SmallSeparator>•</SmallSeparator>
        <Subtitle style={{ fontSize: '18px' }}>1392 hours</Subtitle>
        <SmallSeparator>•</SmallSeparator>
        <Status active style={{ fontSize: '18px' }}>
          Active
        </Status>
      </SubtitleWrapper>
      <OrganizationCard>
        <OrganizationCardInnerWrapper>
          <CardInnerWrapper>
            <CardInnerText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </CardInnerText>
            <CardInnerText>
              123 Apple Street, Redwood City, CA 94063
            </CardInnerText>
          </CardInnerWrapper>
        </OrganizationCardInnerWrapper>
        <InnerSectionWrapper>
          <Section>
            <SectionHeaderWrapper>
              <img src={contactIcon} alt="" />
              <SectionHeader>Point of contact</SectionHeader>
            </SectionHeaderWrapper>
            <OrganizationSectionText>
              <BodyTextSegment>
                <BodyTextHeader>NAME</BodyTextHeader>
                <BodyText>Clarence Patterson</BodyText>
              </BodyTextSegment>
              <BodyTextSegment>
                <BodyTextHeader>PHONE</BodyTextHeader>
                <BodyText>(123) 456-7890</BodyText>
              </BodyTextSegment>
              <BodyTextSegment>
                <BodyTextHeader>EMAIL</BodyTextHeader>
                <BodyText>clarence@openlattice.com</BodyText>
              </BodyTextSegment>
            </OrganizationSectionText>
          </Section>
          <Section>
            <SectionHeaderWrapper>
              <img src={clockIcon} alt="" />
              <SectionHeader>Hours of operation</SectionHeader>
            </SectionHeaderWrapper>
            <SectionBlockWrapper>
              <OrganizationSectionText>
                <BodyText>Monday</BodyText>
                <BodyText>Tuesday</BodyText>
                <BodyText>Wednesday</BodyText>
                <BodyText>Thursday</BodyText>
                <BodyText>Friday</BodyText>
                <BodyText>Saturday</BodyText>
                <BodyText>Sunday</BodyText>
              </OrganizationSectionText>
              <OrganizationSectionText style={{ marginLeft: '100px' }}>
                <BodyText>09:00 — 18:00</BodyText>
                <BodyText>09:00 — 18:00</BodyText>
                <BodyText>14:00 — 18:00</BodyText>
                <BodyText>09:00 — 18:00</BodyText>
                <BodyText>09:00 — 11:50</BodyText>
                <BodyText>Unavailable</BodyText>
                <BodyText>Unavailable</BodyText>
              </OrganizationSectionText>
            </SectionBlockWrapper>
          </Section>
        </InnerSectionWrapper>
        <InnerSectionWrapper>
          <Section>
            <SectionHeaderWrapper>
              <img src={contactIcon} alt="" />
              <SectionHeader>Available work</SectionHeader>
            </SectionHeaderWrapper>
            <SectionBlockWrapper>
              <OrganizationSectionText>
                <BodyText>A description of the available work at this worksite.</BodyText>
              </OrganizationSectionText>
            </SectionBlockWrapper>
          </Section>
        </InnerSectionWrapper>
      </OrganizationCard>
    </ContainerInnerWrapper>
  </ContainerOuterWrapper>
);

export default WorksiteContainer;
