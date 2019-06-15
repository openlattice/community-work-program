/*
 * @flow
 */

import React from 'react';
import { List, Map } from 'immutable';
import { faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
  courtType :string | void;
  dates :Object;
  handleSelect :(personEKID :string) => void;
  hoursRequired :number | string;
  hoursWorked :number | void;
  person :Map;
  selected ? :boolean;
  small ? :boolean;
  status ? :string | void;
  violationsCount :number | void;
  warningsCount :number | void;
};

const TableRow = ({
  ageRequired,
  courtType,
  dates,
  handleSelect,
  hoursRequired,
  hoursWorked,
  person,
  selected,
  small,
  status,
  violationsCount,
  warningsCount,
} :Props) => {

  const { [ENTITY_KEY_ID]: personEKID, [DOB]: dateOfBirth } = getEntityProperties(person, [ENTITY_KEY_ID, DOB]);
  const {
    enrollmentDeadline,
    sentenceDate,
    sentenceEndDate,
    startDate,
  } = dates;

  let photo = person ? person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]) : '';
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <FontAwesomeIcon icon={faUserCircle} color="#D8D8D8" size="2x" />;

  let cellData :List = List();
  cellData = person ? cellData.push(getPersonName(person)) : cellData;
  cellData = (person && ageRequired) ? cellData.push(formatNumericalValue(calculateAge(dateOfBirth))) : cellData;
  cellData = (person && isDefined(startDate)) ? cellData.push(formatAsDate(startDate)) : cellData;
  cellData = (person && isDefined(sentenceDate)) ? cellData.push(formatAsDate(sentenceDate)) : cellData;
  cellData = (person && isDefined(enrollmentDeadline)) ? cellData.push(enrollmentDeadline) : cellData;
  cellData = (person && isDefined(sentenceEndDate)) ? cellData.push(sentenceEndDate) : cellData;
  cellData = isDefined(status) ? cellData.push(status) : cellData;
  cellData = isDefined(warningsCount) ? cellData.push(formatNumericalValue(warningsCount)) : cellData;
  cellData = isDefined(violationsCount) ? cellData.push(formatNumericalValue(violationsCount)) : cellData;
  cellData = (isDefined(hoursWorked) && isDefined(hoursRequired))
    ? cellData.push(`${formatNumericalValue(hoursWorked)} / ${(formatNumericalValue(hoursRequired))}`)
    : cellData;
  cellData = (!isDefined(hoursWorked) && isDefined(hoursRequired))
    ? cellData.push(formatNumericalValue(hoursRequired))
    : cellData;
  cellData = isDefined(courtType) ? cellData.push(courtType) : cellData;

  return (
    <Row
        active={selected}
        onClick={() => {
          handleSelect(personEKID);
        }}>
      <Cell small={small}>{ photo }</Cell>
      {
        cellData.map((field :string, index :number) => (
          <Cell key={`${index}-${field}`} small={small} status={field}>{ field }</Cell>
        ))
      }
    </Row>
  );
};

TableRow.defaultProps = {
  selected: false,
  small: false,
  status: undefined
};

export default TableRow;
