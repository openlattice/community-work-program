
/*
 * @flow
 */

import React from 'react';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';

import { PersonPicture } from '../picture/PersonPicture';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { calculateAge, formatAsDate } from '../../utils/DateTimeUtils';
import { ENTITY_KEY_ID, PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getPersonName } from '../../utils/PeopleUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';

const { DOB, MUGSHOT, PICTURE } = PEOPLE_FQNS;

type Props = {
  handleSelect :(personEKID :string) => void;
  hoursRequired :number;
  hoursWorked :number | void;
  includeDeadline ? :boolean;
  person :Map;
  selected? :boolean;
  sentenceDate :string;
  small? :boolean;
  violationsCount :number;
  warningsCount :number;
};

const TableRow = ({
  handleSelect,
  hoursRequired,
  hoursWorked,
  includeDeadline,
  person,
  selected,
  sentenceDate,
  small,
  violationsCount,
  warningsCount,
} :Props) => {

  const { [ENTITY_KEY_ID]: personEKID, [DOB]: dateOfBirth } = getEntityProperties(person, [ENTITY_KEY_ID, DOB]);

  let photo = person ? person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]) : '';
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  let cellData :List = List();
  cellData = person ? cellData.push(getPersonName(person)) : cellData;
  cellData = person ? cellData
    .push(calculateAge(dateOfBirth)) : cellData;
  // find start date from enrollment status -> "effective date"
  cellData = sentenceDate ? cellData.push(formatAsDate(sentenceDate)) : cellData;
  cellData = (sentenceDate && includeDeadline)
    ? cellData.push(DateTime.fromISO(sentenceDate).plus({ weeks: 2 }).toLocaleString())
    : cellData;
  cellData = sentenceDate
    ? cellData.push(DateTime.fromISO(sentenceDate).plus({ days: 90 }).toLocaleString())
    : cellData;
  // find status from diversion plan and/or enrollment status
  cellData = warningsCount ? cellData.push(formatNumericalValue(warningsCount)) : cellData;
  cellData = violationsCount ? cellData.push(formatNumericalValue(violationsCount)) : cellData;
  cellData = (hoursWorked && hoursRequired) ? cellData
    .push(`${formatNumericalValue(hoursWorked)} / ${(formatNumericalValue(hoursRequired))}`) : cellData;
  cellData = (hoursRequired && !hoursWorked) ? cellData.push(formatNumericalValue(hoursRequired)) : cellData;

  // const typeOfCourt = formatValue(person.get('typeOfCourt'));

  return (
    <Row active={selected} onClick={() => { handleSelect(personEKID) }}>
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
