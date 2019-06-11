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
import { isDefined } from '../../utils/LangUtils';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';

const { DOB, MUGSHOT, PICTURE } = PEOPLE_FQNS;

type Props = {
  ageRequired :boolean;
  handleSelect :(personEKID :string) => void;
  hoursRequired :number;
  hoursWorked :number | void;
  includeDeadline ? :boolean;
  person :Map;
  selected? :boolean;
  sentenceDate? :string | void;
  sentenceEndDate? :string | void;
  small? :boolean;
  startDate? :string | void;
  status? :string | void;
  violationsCount :number | void;
  warningsCount :number | void;
};

const TableRow = ({
  ageRequired,
  handleSelect,
  hoursRequired,
  hoursWorked,
  includeDeadline,
  person,
  selected,
  sentenceDate,
  sentenceEndDate,
  small,
  startDate,
  status,
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
  cellData = (person && ageRequired) ? cellData.push(formatNumericalValue(calculateAge(dateOfBirth))) : cellData;
  cellData = (person && isDefined(startDate)) ? cellData.push(formatAsDate(startDate)) : cellData;
  cellData = isDefined(sentenceDate) ? cellData.push(formatAsDate(sentenceDate)) : cellData;
  cellData = (sentenceDate && includeDeadline)
    ? cellData.push(DateTime.fromISO(sentenceDate).plus({ hours: 48 }).toLocaleString())
    : cellData;
  cellData = isDefined(sentenceEndDate) ? cellData.push(formatAsDate(sentenceEndDate)) : cellData;
  cellData = isDefined(status) ? cellData.push(status) : cellData;
  cellData = isDefined(warningsCount) ? cellData.push(formatNumericalValue(warningsCount)) : cellData;
  cellData = isDefined(violationsCount) ? cellData.push(formatNumericalValue(violationsCount)) : cellData;
  cellData = (hoursWorked && hoursRequired)
    ? cellData.push(`${formatNumericalValue(hoursWorked)} / ${(formatNumericalValue(hoursRequired))}`)
    : cellData;
  cellData = (hoursRequired && !isDefined(hoursWorked)) ? cellData.push(formatNumericalValue(hoursRequired)) : cellData;

  // const typeOfCourt = formatValue(person.get('typeOfCourt'));

  return (
    <Row
        active={selected}
        onClick={() => {
          handleSelect(personEKID);
        }}>
      <Cell small={small}>{ photo }</Cell>
      {
        cellData.map((field :string, index :number) => (
          <Cell key={`${index}-${field}`} small={small}>{ field }</Cell>
        ))
      }
    </Row>
  );
};

TableRow.defaultProps = {
  includeDeadline: false,
  sentenceDate: undefined,
  sentenceEndDate: undefined,
  selected: false,
  small: false,
  startDate: undefined,
  status: undefined
};

export default TableRow;
