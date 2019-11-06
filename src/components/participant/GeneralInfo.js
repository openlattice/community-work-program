// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Label, StyleUtils } from 'lattice-ui-kit';
import { faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withRouter } from 'react-router-dom';

import { ENROLLMENT_STATUS_COLORS, OL } from '../../core/style/Colors';
import { PersonPhoto, PersonPicture } from '../picture/PersonPicture';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';

const { getStyleVariation } = StyleUtils;
const {
  DOB,
  MUGSHOT,
  FIRST_NAME,
  LAST_NAME
} = PROPERTY_TYPE_FQNS;

const statusColorVariation = getStyleVariation('status', {
  default: OL.GREY02,
  [ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [ENROLLMENT_STATUSES.ACTIVE_REOPENED]: ENROLLMENT_STATUS_COLORS.ACTIVE_REOPENED,
  [ENROLLMENT_STATUSES.AWAITING_CHECKIN]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
  [ENROLLMENT_STATUSES.AWAITING_ORIENTATION]: ENROLLMENT_STATUS_COLORS.AWAITING_ORIENTATION,
  [ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.COMPLETED,
  [ENROLLMENT_STATUSES.JOB_SEARCH]: ENROLLMENT_STATUS_COLORS.JOB_SEARCH,
  [ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT]: ENROLLMENT_STATUS_COLORS.REMOVED_NONCOMPLIANT,
  [ENROLLMENT_STATUSES.SUCCESSFUL]: ENROLLMENT_STATUS_COLORS.SUCCESSFUL,
  [ENROLLMENT_STATUSES.UNSUCCESSFUL]: ENROLLMENT_STATUS_COLORS.UNSUCCESSFUL,
});

const NameHeader = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
  margin: 15px 0;
`;

const InfoWrapper = styled.div`
  align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 30px;
  width: 425px;
`;

const StyledPersonPhoto = styled(PersonPhoto)`
  align-items: center;
  display: flex;
  height: 100px;
  justify-content: center;
  width: 100px;
`;

const InfoRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${OL.GREY08};
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin: 8px 0;
  padding: 0 0 8px 0;
  width: 100%;

  :last-of-type {
    border: none;
  }
`;

const Value = styled.div`
  color: ${statusColorVariation};
  font-weight: ${(props) => props.fontWeight};
  text-align: left;
  width: 60%;
`;

type Props = {
  address :string;
  email :string;
  person :Map;
  phone :string;
  status :string;
};

const GeneralInfo = ({
  address,
  email,
  person,
  phone,
  status
} :Props) => {

  const {
    [DOB]: dateOfBirth,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [MUGSHOT]: mugshot,
  } = getEntityProperties(person, [DOB, FIRST_NAME, LAST_NAME, MUGSHOT]);
  const dob = formatAsDate(dateOfBirth);
  return (
    <InfoWrapper>
      {
        person && mugshot
          ? (
            <StyledPersonPhoto>
              <PersonPicture src={mugshot} />
            </StyledPersonPhoto>
          )
          : (
            <FontAwesomeIcon icon={faUserCircle} size="6x" color="#D8D8D8" />
          )
      }
      <NameHeader>{ `${firstName} ${lastName}` }</NameHeader>
      <InfoRow>
        <Label subtle>Status</Label>
        <Value
            status={status}>
          { status }
        </Value>
      </InfoRow>
      <InfoRow>
        <Label subtle>Date of Birth</Label>
        <Value>{ dob }</Value>
      </InfoRow>
      <InfoRow>
        <Label subtle>Phone #</Label>
        <Value>{ phone }</Value>
      </InfoRow>
      <InfoRow>
        <Label subtle>Address</Label>
        <Value>{ address }</Value>
      </InfoRow>
      <InfoRow>
        <Label subtle>Email</Label>
        <Value>{ email }</Value>
      </InfoRow>
    </InfoWrapper>
  );
}

export default withRouter(GeneralInfo);
