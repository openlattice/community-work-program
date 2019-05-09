/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';
import { faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { PersonPicture, PersonPhoto } from '../picture/PersonPicture';
import { formatValue, formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { OL } from '../../utils/constants/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const Cell = styled.td`
  padding: 10px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.small ? '12' : '14')}px;
  text-align: left;
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
`;

type Props = {
  contactInfo :Immutable.Map;
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void;
  person :Immutable.Map<*, *>,
  selectPerson :(selectedPerson :Immutable.Map, contactInfo :Immutable.List) => void;
  selected? :boolean,
  small? :boolean,
};

const TableRow = ({
  contactInfo,
  handleSelect,
  person,
  selectPerson,
  selected,
  small
} :Props) => {

  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');
  const personId :string = person.get('personId');

  // let photo :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  let photo;
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <FontAwesomeIcon icon={faUserCircle} size="2x" color="#D8D8D8" />;

  /* BASED ON DUMMY DATA */
  const name = formatValue(person.get('name'));
  const age = formatNumericalValue(person.get('age'));
  const startDate = formatAsDate(person.get('startDate'));
  const sentenceDate = formatAsDate(person.get('sentenceDate'));
  const sentenceEndDate = formatAsDate(person.get('sentenceEndDate'));
  const hoursServed = formatValue(person.get('hoursServed'));
  const numberOfWarnings = formatNumericalValue(person.get('numberOfWarnings'));
  const numberOfViolations = formatNumericalValue(person.get('numberOfViolations'));
  const status = formatValue(person.get('status'));

  return (
    <Row
        active={selected}
        onClick={() => {
          if (handleSelect) {
            handleSelect(person, entityKeyId, personId);
          }
          if (selectPerson) {
            selectPerson(person, contactInfo);
          }
        }}>
      <Cell small={small}>{ photo }</Cell>
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ age }</Cell>
      <Cell small={small}>{ startDate }</Cell>
      <Cell small={small}>{ sentenceDate }</Cell>
      <Cell small={small}>{ sentenceEndDate }</Cell>
      <Cell small={small} status={status} fontWeight={600}>{ status }</Cell>
      <Cell small={small}>{ hoursServed }</Cell>
      <Cell small={small}>{ numberOfWarnings }</Cell>
      <Cell small={small}>{ numberOfViolations }</Cell>
    </Row>
  );
};

TableRow.defaultProps = {
  handleSelect: () => {},
  selected: false,
  small: false
};

export default TableRow;
