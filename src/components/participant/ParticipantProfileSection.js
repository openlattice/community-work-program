// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Label
} from 'lattice-ui-kit';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withRouter } from 'react-router-dom';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  SmallEditButton,
} from './SectionStyledComponents';
import { OL } from '../../core/style/Colors';
import { PersonPhoto, PersonPicture } from '../picture/PersonPicture';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const {
  DOB,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  MUGSHOT,
  RACE,
  SEX,
} = PEOPLE_FQNS;

const PersonHeaderRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 20px;
`;

const PersonNameHeader = styled.div`
  color: ${OL.BLACK};
  font-size: 26px;
  font-weight: 600;
  margin-top: 14px;
  text-align: center;
  width: 100%;
`;

const PersonCard = styled(Card)`
  height: 603px;
`;

const PersonInfoRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const PersonValue = styled.div`
  text-align: left;
  width: 60%;
`;

type Props = {
  address :string;
  email :string;
  person :Map;
  phone :string;
};

const ParticipantProfileSection = ({
  address,
  email,
  person,
  phone,
} :Props) => {

  const {
    [DOB]: dateOfBirth,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [MUGSHOT]: mugshot,
    [RACE]: race,
    [ETHNICITY]: ethnicity,
    [SEX]: sex,
  } = getEntityProperties(person, [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, MUGSHOT, RACE, SEX]);

  const fullName = `${firstName} ${lastName}`;
  const dob = formatAsDate(dateOfBirth);
  const raceAndEthnicity = (race && ethnicity)
    ? `${race}/${ethnicity}`
    : (`${race}` || `${ethnicity}` || EMPTY_FIELD);

  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Participant Profile</SectionLabel>
        <SmallEditButton mode="subtle" onClick={() => {}} />
      </SectionNameRow>
      <PersonCard>
        <PersonHeaderRow>
          {
            person && mugshot
              ? (
                <PersonPhoto>
                  <PersonPicture src={mugshot} />
                </PersonPhoto>
              )
              : (
                <FontAwesomeIcon icon={faUser} size="6x" color="#D8D8D8" />
              )
          }
          <PersonNameHeader>{ fullName }</PersonNameHeader>
        </PersonHeaderRow>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Date of Birth</Label>
            <PersonValue>{ dob || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Race/Ethnicity</Label>
            <PersonValue>{ raceAndEthnicity }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Sex</Label>
            <PersonValue>{ sex || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Phone #</Label>
            <PersonValue>{ phone || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Email</Label>
            <PersonValue>{ email || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Address</Label>
            <PersonValue>{ address || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
      </PersonCard>
    </SectionWrapper>
  );
};

export default withRouter(ParticipantProfileSection);
