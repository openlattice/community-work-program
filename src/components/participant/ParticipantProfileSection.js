// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Label,
} from 'lattice-ui-kit';
import { withRouter } from 'react-router-dom';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  StyledEditButton,
} from './SectionStyledComponents';
import { OL } from '../../core/style/Colors';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { formatPairOfStrings } from '../../utils/FormattingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { getPersonFullName, getPersonProfilePicture } from '../../utils/PeopleUtils';
import {
  ADDRESS_FQNS,
  CONTACT_INFO_FQNS,
  PEOPLE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const { FULL_ADDRESS } = ADDRESS_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const {
  DOB,
  ETHNICITY,
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

const PersonInfoRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const PersonValue = styled.div`
  display: block;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 200px;
`;

type Props = {
  address :Map;
  edit :() => void;
  email :Map;
  person :Map;
  personPhoto :Map;
  phone :Map;
};

const ParticipantProfileSection = ({
  address,
  edit,
  email,
  person,
  personPhoto,
  phone,
} :Props) => {

  const {
    [DOB]: dateOfBirth,
    [RACE]: race,
    [ETHNICITY]: ethnicity,
    [SEX]: sex,
  } = getEntityProperties(person, [DOB, ETHNICITY, RACE, SEX]);

  const picture = getPersonProfilePicture(person, personPhoto);
  const fullName = getPersonFullName(person);
  const dob = formatAsDate(dateOfBirth);
  const raceAndEthnicity = formatPairOfStrings([race, ethnicity]);

  const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(phone, [PHONE_NUMBER]);
  const { [EMAIL]: emailAddress } = getEntityProperties(email, [EMAIL]);
  const { [FULL_ADDRESS]: personAddress } = getEntityProperties(address, [FULL_ADDRESS]);

  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Participant Profile</SectionLabel>
        <StyledEditButton mode="subtle" onClick={edit} />
      </SectionNameRow>
      <Card>
        <PersonHeaderRow>
          {picture}
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
            <PersonValue>{ phoneNumber || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Email</Label>
            <PersonValue>{ emailAddress || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
        <CardSegment noBleed padding="0">
          <PersonInfoRow>
            <Label subtle>Address</Label>
            <PersonValue>{ personAddress || EMPTY_FIELD }</PersonValue>
          </PersonInfoRow>
        </CardSegment>
      </Card>
    </SectionWrapper>
  );
};

export default withRouter(ParticipantProfileSection);
