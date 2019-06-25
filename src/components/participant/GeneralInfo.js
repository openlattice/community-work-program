// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { StyleUtils } from 'lattice-ui-kit';
import { faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withRouter } from 'react-router-dom';

import { ENROLLMENT_STATUS_COLORS, OL } from '../../core/style/Colors';
import { PersonPhoto, PersonPicture } from '../picture/PersonPicture';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';

const { getStyleVariation } = StyleUtils;
const { DOB, MUGSHOT } = PEOPLE_FQNS;

const statusColorVariation = getStyleVariation('status', {
  default: `${OL.GREY02}`,
  [ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT]: ENROLLMENT_STATUS_COLORS.ACTIVE_NONCOMPLIANT,
  [ENROLLMENT_STATUSES.AWAITING_ENROLLMENT]: ENROLLMENT_STATUS_COLORS.AWAITING_ENROLLMENT,
  [ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.COMPLETED,
  [ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT]: ENROLLMENT_STATUS_COLORS.REMOVED_NONCOMPLIANT,
});

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
  color: ${statusColorVariation};
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

  const { [DOB]: dateOfBirth, [MUGSHOT]: mugshot } = getEntityProperties(person, [DOB, MUGSHOT]);
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
            <StyledPlaceholderPicture>
              <FontAwesomeIcon icon={faUserCircle} size="6x" color="#D8D8D8" />
            </StyledPlaceholderPicture>
          )
      }
      <InfoRow>
        <Title>Status</Title>
        <Value
            status={status}>
          { status }
        </Value>
      </InfoRow>
      <InfoRow>
        <Title>Date of Birth</Title>
        <Value>{ dob }</Value>
      </InfoRow>
      <InfoRow>
        <Title>Phone #</Title>
        <Value>{ phone }</Value>
      </InfoRow>
      <InfoRow>
        <Title>Address</Title>
        <Value>{ address }</Value>
      </InfoRow>
      <InfoRow>
        <Title>Email</Title>
        <Value>{ email }</Value>
      </InfoRow>
    </InfoWrapper>
  );
}

export default withRouter(GeneralInfo);
