/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatNumericalValue } from '../../utils/FormattingUtils';
import { PersonPicture } from '../picture/PersonPicture';
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
const { REQUIRED, WORKED } = HOURS_CONSTS;
const { OPENLATTICE_ID_FQN } = Constants;


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

  const entityKeyId :string = person.getIn([OPENLATTICE_ID_FQN, 0], '');

  let photo :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  const name = `${formatValue(person.getIn([FIRST_NAME, 0]))} ${formatValue(person.getIn([LAST_NAME, 0]))}`;
  const numberViolations = formatNumericalValue(violationsCount);

  const worked = hours ? hours.get(WORKED) : 0;
  const required = hours ? hours.get(REQUIRED) : 0;
  const hoursServed = `${formatNumericalValue(worked)} / ${formatNumericalValue(required)}`;

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
