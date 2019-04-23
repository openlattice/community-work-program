/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import { formatValue, formatNumericalValue, formatDate } from '../../utils/FormattingUtils';
import { OL } from '../../core/style/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const Cell = styled.td`
  padding: 15px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.small ? '12' : '14')}px;
  text-align: left;
  color: ${OL.GREY01};
`;

const Row = styled.tr`
  padding: 15px 30px;
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
  contactInfo :Immutable.Map;
  handleSelect :(worksite :Immutable.Map, entityKeyId :string, worksiteId :string) => void;
  worksite :Immutable.Map<*, *>,
  selectWorksite :(selectedWorksite :Immutable.Map, contactInfo :Immutable.List) => void;
  selected? :boolean,
  small? :boolean,
};

const TableRow = ({
  contactInfo,
  handleSelect,
  worksite,
  selectWorksite,
  selected,
  small
} :Props) => {

  const entityKeyId :string = worksite.getIn([OPENLATTICE_ID_FQN, 0], '');
  const worksiteId :string = worksite.get('worksiteId');

  /* BASED ON DUMMY DATA */
  const name = formatValue(worksite.get('name'));
  const status = formatValue(worksite.get('status'));
  const startDate = formatDate(worksite.get('startDate'), 'MM/DD/YYYY');
  const lastActiveDate = formatDate(worksite.get('lastActiveDate'), 'MM/DD/YYYY');
  const scheduledParticipantCount = formatNumericalValue(worksite.get('scheduledParticipantCount'));
  const pastParticipantCount = formatNumericalValue(worksite.get('pastParticipantCount'));
  const totalHours = formatNumericalValue(worksite.get('totalHours'));

  return (
    <Row
        active={selected}
        onClick={() => {
          if (handleSelect) {
            handleSelect(worksite, entityKeyId, worksiteId);
          }
          if (selectWorksite) {
            selectWorksite(worksite, contactInfo);
          }
        }}>
      <Cell small={small} />
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ status }</Cell>
      <Cell small={small}>{ startDate }</Cell>
      <Cell small={small}>{ lastActiveDate }</Cell>
      <Cell small={small}>{ scheduledParticipantCount }</Cell>
      <Cell small={small}>{ pastParticipantCount }</Cell>
      <Cell small={small}>{ totalHours }</Cell>
    </Row>
  );
};

TableRow.defaultProps = {
  handleSelect: () => {},
  selected: false,
  small: false
};

export default TableRow;
