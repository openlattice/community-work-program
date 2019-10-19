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
import { getEntityProperties } from '../../utils/DataUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { isDefined } from '../../utils/LangUtils';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';

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

  let photo = '';
  let cellData :List = List();

  if (isDefined(person)) {

    photo = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
    photo = photo
      ? (
        <StyledPersonPhoto small={small}>
          <PersonPicture src={photo} alt="" />
        </StyledPersonPhoto>
      ) : <FontAwesomeIcon icon={faUserCircle} color="#D8D8D8" size="2x" />;

    cellData = List().withMutations((list :List) => {
      list.push(getPersonFullName(person));
      if (ageRequired) list.push(formatNumericalValue(calculateAge(dateOfBirth)));
      if (isDefined(startDate)) list.push(formatAsDate(startDate));
      if (isDefined(sentenceDate)) list.push(formatAsDate(sentenceDate));
      if (isDefined(enrollmentDeadline)) list.push(enrollmentDeadline);
      if (isDefined(sentenceEndDate)) list.push(sentenceEndDate);
      if (isDefined(status)) list.push(status);
      if (isDefined(warningsCount)) list.push(formatNumericalValue(warningsCount));
      if (isDefined(violationsCount)) list.push(formatNumericalValue(violationsCount));
      if (isDefined(hoursWorked) && isDefined(hoursRequired)) {
        if (!hoursWorked && !hoursRequired) list.push('');
        else list.push(`${formatNumericalValue(hoursWorked)} / ${(formatNumericalValue(hoursRequired))}`);
      }
      if (!isDefined(hoursWorked) && isDefined(hoursRequired)) list.push(formatNumericalValue(hoursRequired));
      if (isDefined(courtType)) list.push(courtType);
    });
  }

  return (
    <Row
        active={selected}
        onClick={() => {
          handleSelect(personEKID);
        }}>
      <Cell small={small}>{ photo }</Cell>
      {
        cellData.map((field :string, index :number) => {
          const text = Object.values(ENROLLMENT_STATUSES).includes(field) ? field : 'default';
          return (
            <Cell key={`${index}-${field}`} small={small} status={text}>{ field }</Cell>
          );
        })
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
