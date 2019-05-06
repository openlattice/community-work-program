// @flow
import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RouterHistory } from 'react-router';

import WorksitesTable from '../../components/table/WorksitesTable';
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
  InnerSectionWrapper,
  Section,
  SectionHeaderWrapper,
  SectionHeader,
  BodyTextSegment,
  BodyTextHeader,
  BodyText,
  RowWrapper,
  Menu,
  MenuItem,
  TableBanner,
  TableFooter,
  FooterCell,
} from '../../components/Layout';
import { BackNavButton, PrimaryButton, TertiaryButton } from '../../components/controls/index';
import { OL } from '../../core/style/Colors';
import { ORGANIZATION } from '../../utils/constants/ReduxStateConsts';
import { getOrganization } from './OrganizationActions';
import { worksites } from '../worksites/FakeData';

/* constants */
const currentWorksites :List = worksites.filter((ws :Map) => ws.get('organization') === 'Pennington County Center');
const worksiteHeader :string = currentWorksites.count() !== 1 ? `${currentWorksites.count()} Worksites` : '1 Worksite';

const {
  ACTIONS,
  IS_FETCHING_ORGANIZATION,
  SELECTED_ORGANIZATION,
} = ORGANIZATION;

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

const ScheduleCard = styled(CardOuterWrapper)`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
`;

type Props = {
  [ACTIONS]:{
    getOrganization :() => void;
  },
  IS_FETCHING_ORGANIZATION :boolean;
  SELECTED_ORGANIZATION :Map;
  history :RouterHistory;
};
/* eslint-disable max-len */
const OrganizationContainer = ({ history } :Props) => (
  <ContainerOuterWrapper>
    <ContainerInnerWrapper style={{ padding: '0' }}>
      <BackNavButton
          onClick={() => {
            history.push(Routes.WORKSITES);
          }}>
        Back to Worksites
      </BackNavButton>
      <HeaderWrapperWithButtons>
        <ContainerHeader>Pennington County Center</ContainerHeader>
        <ButtonWrapper>
          <TertiaryButton>Edit Info</TertiaryButton>
          <PrimaryButton>Change Status</PrimaryButton>
        </ButtonWrapper>
      </HeaderWrapperWithButtons>
      <SubtitleWrapper>
        <Subtitle style={{ fontSize: '18px' }}>{worksiteHeader}</Subtitle>
        <SmallSeparator>•</SmallSeparator>
        <Status active style={{ fontSize: '18px' }}>
          Active
        </Status>
      </SubtitleWrapper>
      <OrganizationCard>
        <OrganizationCardInnerWrapper>
          <CardInnerWrapper>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
      </OrganizationCard>
    </ContainerInnerWrapper>
    <ContainerInnerWrapper style={{ padding: '0' }}>
      <ContainerHeader>Worksites</ContainerHeader>
      <RowWrapper style={{ marginTop: '35px' }}>
        <Menu>
          <MenuItem selected>All</MenuItem>
          <MenuItem>Active</MenuItem>
          <MenuItem>Inactive</MenuItem>
        </Menu>
      </RowWrapper>
      <ScheduleCard>
        <TableBanner>{worksiteHeader}</TableBanner>
        <WorksitesTable
            handleSelect={() => {}}
            selectedWorksiteId=""
            small={false}
            selectWorksite={() => {}}
            tableMargin="0"
            worksites={currentWorksites} />
        <TableFooter>
          <FooterCell style={{ width: '59.5%' }}>Total</FooterCell>
          <FooterCell style={{ width: '16.5%' }}>11</FooterCell>
          <FooterCell style={{ width: '14%' }}>24</FooterCell>
          <FooterCell>866</FooterCell>
        </TableFooter>
      </ScheduleCard>
    </ContainerInnerWrapper>
  </ContainerOuterWrapper>
);

const mapStateToProps = state => ({
  [IS_FETCHING_ORGANIZATION]: state.getIn([ORGANIZATION, IS_FETCHING_ORGANIZATION]),
  [SELECTED_ORGANIZATION]: state.getIn([ORGANIZATION, SELECTED_ORGANIZATION]),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getOrganization,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationContainer);
