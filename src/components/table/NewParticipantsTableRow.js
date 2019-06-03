/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatNumericalValue } from '../../utils/FormattingUtils';

import { PersonPicture } from '../picture/PersonPicture';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';

const {
  FIRST_NAME,
  LAST_NAME,
  MUGSHOT,
  PICTURE
} = PEOPLE_FQNS;
const { REQUIRED } = HOURS_CONSTS;
const { OPENLATTICE_ID_FQN } = Constants;


type Props = {
  hours :Map;
  person :Map;
  selected? :boolean;
  sentenceDate :string;
  small? :boolean;
};

const TableRow = ({
  hours,
  person,
  selected,
  sentenceDate,
  small
} :Props) => {

  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');
  const personId :string = '';

  let photo :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  const name = `${formatValue(person.getIn([FIRST_NAME, 0]))} ${formatValue(person.getIn([LAST_NAME, 0]))}`;
  const sentenceDateDisplay = formatAsDate(sentenceDate);
  const enrollmentDeadline = DateTime.fromISO(sentenceDate).plus({ weeks: 2 }).toLocaleString();
  const requiredHours = formatNumericalValue(hours.get(REQUIRED));

  return (
    <Row active={selected}>
      <Cell small={small}>{ photo }</Cell>
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ sentenceDateDisplay }</Cell>
      <Cell small={small}>{ enrollmentDeadline }</Cell>
      <Cell small={small}>{ requiredHours }</Cell>
    </Row>
  );
};

TableRow.defaultProps = {
  selected: false,
  small: false
};

export default TableRow;
