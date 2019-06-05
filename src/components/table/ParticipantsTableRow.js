/*
 * @flow
 */

import React from 'react';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';

import { PersonPicture } from '../picture/PersonPicture';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getPersonName } from '../../utils/PeopleUtils';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';

const { MUGSHOT, PICTURE } = PEOPLE_FQNS;

type Props = {
  hoursRequired :number;
  hoursWorked :number | void;
  includeDeadline ? :boolean;
  person :Map;
  selected? :boolean;
  sentenceDate :string;
  small? :boolean;
  violationsCount :number;
};

const TableRow = ({
  hoursRequired,
  hoursWorked,
  includeDeadline,
  person,
  selected,
  sentenceDate,
  small,
  violationsCount,
} :Props) => {

  let photo = person ? person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]) : '';
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  let cellData :List = List();
  cellData = person ? cellData.push(getPersonName(person)) : cellData;
  cellData = sentenceDate ? cellData.push(formatAsDate(sentenceDate)) : cellData;
  cellData = (sentenceDate && includeDeadline) ? cellData
    .push(DateTime.fromISO(sentenceDate).plus({ weeks: 2 }).toLocaleString())
    : cellData;
  cellData = violationsCount ? cellData.push(formatNumericalValue(violationsCount)) : cellData;
  cellData = (hoursWorked && hoursRequired) ? cellData
    .push(`${formatNumericalValue(hoursWorked)} / ${(formatNumericalValue(hoursRequired))}`) : cellData;
  cellData = (hoursRequired && !hoursWorked) ? cellData.push(formatNumericalValue(hoursRequired)) : cellData;

  return (
    <Row active={selected}>
      <Cell small={small}>{ photo }</Cell>
      {
        cellData.map(field => (
          <Cell key={field} small={small}>{ field }</Cell>
        ))
      }
    </Row>
  );
};

TableRow.defaultProps = {
  includeDeadline: false,
  selected: false,
  small: false
};

export default TableRow;
