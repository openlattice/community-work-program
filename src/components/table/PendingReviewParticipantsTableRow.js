/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PersonPicture } from '../picture/PersonPicture';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { getPersonName } from '../../utils/PeopleUtils';
import {
  Cell,
  Row,
  StyledPersonPhoto,
} from './TableStyledComponents';

const { MUGSHOT, PICTURE } = PEOPLE_FQNS;
const { REQUIRED } = HOURS_CONSTS;

type Props = {
  hours :Map;
  person :Map;
  selected? :boolean;
  sentenceDate :string;
  small? :boolean;
};

const PendingReviewParticipantsTableRow = ({
  hours,
  person,
  selected,
  sentenceDate,
  small,
} :Props) => {

  let photo = person ? person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]) : '';
  photo = photo
    ? (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    ) : <PersonPicture small={small} src={defaultUserIcon} alt="" />;

  const name = person ? getPersonName(person) : '';
  const sentenceDateDisplay = sentenceDate ? formatAsDate(sentenceDate) : '';
  const requiredHours = hours ? formatNumericalValue(hours.get(REQUIRED)) : '';

  return (
    <Row active={selected}>
      <Cell small={small}>{ photo }</Cell>
      <Cell small={small}>{ name }</Cell>
      <Cell small={small}>{ sentenceDateDisplay }</Cell>
      <Cell small={small}>{ requiredHours }</Cell>
    </Row>
  );
};

PendingReviewParticipantsTableRow.defaultProps = {
  selected: false,
  small: false
};

export default PendingReviewParticipantsTableRow;
