/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PersonPicture, PersonPhoto } from '../picture/PersonPicture';
import { formatValue, formatNumericalValue, formatDate } from '../../utils/FormattingUtils';
import { OL } from '../../utils/constants/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const Cell = styled.td`
  padding: 7px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.small ? '12' : '14')}px;
  text-align: left;
  color: ${(props) => {
    if (props.status === 'Active') {
      return `${OL.GREEN02};`;
    }
    if (props.status === 'Completed') {
      return `${OL.BLUE02};`;
    }
    if (props.status === 'Active — noncompliant') {
      return `${OL.YELLOW01};`;
    }
    if (props.status === 'Removed — noncompliant') {
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
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void;
  person :Immutable.Map<*, *>,
  selected? :boolean,
  small? :boolean,
};

const TableRow = ({
  handleSelect,
  person,
  selected,
  small
} :Props) => {

  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');
  const personId :string = '';

  // let photo :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  let photo;
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  /* BASED ON DUMMY DATA */
  const name = formatValue(person.get('name'));
  const age = formatNumericalValue(person.get('age'));
  const startDate = formatDate(person.get('startDate'), 'MM/DD/YYYY');
  const sentenceDate = formatDate(person.get('sentenceDate'), 'MM/DD/YYYY');
  const sentenceEndDate = formatDate(person.get('sentenceEndDate'), 'MM/DD/YYYY');
  const hoursServed = `${formatValue(person.get('hoursServed'))} / ${formatValue(person.get('requiredHours'))}`;
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
        }}>
      <Cell small={small}>{ photo }</Cell>
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ age }</Cell>
      <Cell small={small}>{ startDate }</Cell>
      <Cell small={small}>{ sentenceDate }</Cell>
      <Cell small={small}>{ sentenceEndDate }</Cell>
      <Cell small={small} status={status}>{ status }</Cell>
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
