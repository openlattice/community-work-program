// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { faPenSquare, faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withRouter } from 'react-router-dom';

import { OL } from '../../utils/constants/Colors';
import { PersonPhoto, PersonPicture } from '../picture/PersonPicture';
import { ButtonWrapper } from '../Layout';

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 400px;
  height: 400px;
  border: 1px solid ${OL.GREY11};
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

const StyledPlaceholderPicture = styled.div`
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
  justify-content: space-between;
  align-items: center;
`;

type Props = {
  contactInfo :Map;
  edit :() => void;
  person :Map;
};

const GeneralInfo = ({ contactInfo, edit, person } :Props) => (
  <InfoWrapper>
    {
      person && person.get('mugshot')
        ? (
          <StyledPersonPhoto>
            <PersonPicture src={person.get('mugshot')} alt="" />
          </StyledPersonPhoto>
        )
        : (
          <StyledPlaceholderPicture>
            <FontAwesomeIcon icon={faUserCircle} size="6x" color="#D8D8D8" />
          </StyledPlaceholderPicture>
        )
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
        <ButtonWrapper onClick={edit}>
          <FontAwesomeIcon icon={faPenSquare} size="lg" color={OL.GREY04} />
        </ButtonWrapper>
      </EmailWrapper>
    </InfoRow>
  </InfoWrapper>
);

export default withRouter(GeneralInfo);
