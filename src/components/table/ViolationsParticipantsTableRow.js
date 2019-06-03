/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PersonPicture } from '../picture/PersonPicture';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { getPersonName } from '../../utils/PeopleUtils';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';

const { MUGSHOT, PICTURE } = PEOPLE_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;

type Props = {
  hours :Map;
  person :Map;
  selected? :boolean;
  small? :boolean;
  violationsCount :number;
};

const ViolationsParticipantsTableRow = ({
  hours,
  person,
  selected,
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

  const name = person ? getPersonName(person) : '';
  const numberViolations = formatNumericalValue(violationsCount);
  const hoursServed = hours ? `${formatNumericalValue(
    hours.get(WORKED)
  )} / ${formatNumericalValue(
    hours.get(REQUIRED)
  )}` : '';

  return (
    <Row active={selected}>
      <Cell small={small}>{ photo }</Cell>
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ numberViolations }</Cell>
      <Cell small={small}>{ hoursServed }</Cell>
    </Row>
  );
};

ViolationsParticipantsTableRow.defaultProps = {
  selected: false,
  small: false
};

export default ViolationsParticipantsTableRow;
