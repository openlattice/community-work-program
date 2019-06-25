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
  align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  display: flex;
  flex-direction: column;
  height: 400px;
  justify-content: center;
  padding: 30px;
  width: 400px;
`;

const StyledPersonPhoto = styled(PersonPhoto)`
  align-items: center;
  display: flex;
  height: 100px;
  justify-content: center;
  margin: 0 0 30px 0;
  width: 100px;
`;

const StyledPlaceholderPicture = styled.div`
  margin: 0 0 30px 0;
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

const Title = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  text-align: left;
  width: 40%;
`;

const Value = styled.div`
  color: ${statusColorVariation};
  font-weight: ${props => props.fontWeight};
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
