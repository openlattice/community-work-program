/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PersonPicture, PersonPhoto } from '../picture/PersonPicture';
import { formatValue, formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { OL } from '../../utils/constants/Colors';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const {
  FIRST_NAME,
  LAST_NAME,
  MUGSHOT,
  PICTURE
} = PEOPLE_FQNS;
const { REQUIRED } = HOURS_CONSTS;
const { OPENLATTICE_ID_FQN } = Constants;

const Cell = styled.td`
  padding: 7px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.small ? '12' : '14')}px;
  text-align: left;
  color: ${OL.GREY02};
`;
const StyledPersonPhoto = styled(PersonPhoto)`
  width: ${props => (props.small ? 30 : 36)}px;
  ${props => (props.small
    ? (
      `min-width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;`
    )
    : ''
  )}
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  ${Cell}:first-child {
    padding-left: 30px;
  }
  ${Cell}:last-child {
    padding-right: 30px;
  }
  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }
  &:active {
    background-color: ${OL.PURPLE06};
  }
  :last-of-type {
    border: none;
  }
`;

type Props = {
  hours :Map;
  person :Map;
  selected? :boolean;
  sentenceDate :string;
  small? :boolean;
};

const PendingReviewParticipantsTableRow = ({
  hours,
  person,
  selected,
  sentenceDate,
  small,
} :Props) => {

  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  let photo :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  const name = `${formatValue(person.getIn([FIRST_NAME, 0]))} ${formatValue(person.getIn([LAST_NAME, 0]))}`;
  const sentenceDateDisplay = formatAsDate(sentenceDate);
  const requiredHours = formatNumericalValue(hours.get(REQUIRED));

  return (
    <Row active={selected}>
      <Cell small={small}>{ photo }</Cell>
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ sentenceDateDisplay }</Cell>
      <Cell small={small}>{ requiredHours }</Cell>
    </Row>
  );
};

PendingReviewParticipantsTableRow.defaultProps = {
  selected: false,
  small: false
};

export default PendingReviewParticipantsTableRow;
