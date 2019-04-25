// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import smallEditIcon from '../../assets/svg/small-edit.svg';
import { OL } from '../../utils/constants/Colors';
import { PersonPhoto, PersonPicture } from '../picture/PersonPicture';

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 400px;
  height: 400px;
  border: 1px solid ${OL.GREY08};
  background-color: ${OL.WHITE};
  padding: 30px;
  border-radius: 5px;
`;

const StyledPersonPhoto = styled(PersonPhoto)`
  height: 100px;
  width: 100px;
  margin: 0 0 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledPlaceholderPicture = styled(PersonPicture)`
  height: 100px;
  width: 100px;
  margin: 0 0 30px 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  padding: 0 0 8px 0;
  border-bottom: 1px solid ${OL.GREY08};
  width: 100%;
  font-size: 14px;

  :last-of-type {
    border: none;
  }
`;

const Title = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  text-align: left;
  width: 40%;
`;

const Value = styled.div`
  text-align: left;
  width: 60%;
  font-weight: ${props => props.fontWeight};
  color: ${(props) => {
    if (props.status === 'Active') {
      return `${OL.GREEN02};`;
    }
    if (props.status === 'Completed') {
      return `${OL.BLUE02};`;
    }
    if (props.status === 'Active – noncompliant') {
      return `${OL.YELLOW01};`;
    }
    if (props.status === 'Removed – noncompliant') {
      return `${OL.RED01};`;
    }
    if (props.status === 'Awaiting enrollment') {
      return `${OL.PURPLE03};`;
    }
    return `${OL.GREY01};`;
  }}
`;

const EmailWrapper = styled(Value)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  contactInfo :Map;
  person :Map;
};

const GeneralInfo = ({ contactInfo, person } :Props) => (
  <InfoWrapper>
    {
      person && person.get('mughshot')
        ? (
          <StyledPersonPhoto>
            <PersonPicture src={person.get('mughshot')} alt="" />
          </StyledPersonPhoto>
        )
        : <StyledPlaceholderPicture src={defaultUserIcon} alt="" />
    }
    <InfoRow>
      <Title>Status</Title>
      <Value
          status={person.get('status')}
          fontWeight={600}>
        {person.get('status')}
      </Value>
    </InfoRow>
    <InfoRow>
      <Title>Date of Birth</Title>
      <Value>{person.get('dateOfBirth')}</Value>
    </InfoRow>
    <InfoRow>
      <Title>Phone #</Title>
      <Value>{contactInfo.get('phoneNumber')}</Value>
    </InfoRow>
    <InfoRow>
      <Title>Address</Title>
      <Value>{contactInfo.get('address')}</Value>
    </InfoRow>
    <InfoRow>
      <Title>Email</Title>
      <EmailWrapper>
        {contactInfo.get('email')}
        <img src={smallEditIcon} alt="" />
      </EmailWrapper>
    </InfoRow>
  </InfoWrapper>
);

export default GeneralInfo;
