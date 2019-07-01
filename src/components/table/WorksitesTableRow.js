/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import {
  Cell,
  Row,
} from './TableStyledComponents';
import { formatValue, formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';

type Props = {
  worksite :Map,
  selectWorksite :(selectedWorksite :Map) => void;
  selected? :boolean,
  small? :boolean,
};

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const TableRow = ({
  worksite,
  selectWorksite,
  selected,
  small
} :Props) => {

  /* BASED ON DUMMY DATA */
  const name = formatValue(worksite.get('name'));
  const status = formatValue(worksite.get('status'));
  const startDate = formatAsDate(new Date(worksite.get('startDate')).toISOString());
  const lastActiveDate = formatAsDate(new Date(worksite.get('lastActiveDate')).toISOString());
  const scheduledParticipantCount = formatNumericalValue(worksite.get('scheduledParticipantCount'));
  const pastParticipantCount = formatNumericalValue(worksite.get('pastParticipantCount'));
  const totalHours = formatNumericalValue(worksite.get('totalHours'));

  return (
    <Row
        active={selected}
        onClick={() => {
          if (selectWorksite) {
            selectWorksite(worksite);
          }
        }}>
      <WorksitesCell small={small} />
      <WorksitesCell small={small}>{ name }</WorksitesCell>
      <WorksitesCell small={small}>{ status }</WorksitesCell>
      <WorksitesCell small={small}>{ startDate }</WorksitesCell>
      <WorksitesCell small={small}>{ lastActiveDate }</WorksitesCell>
      <WorksitesCell small={small}>{ scheduledParticipantCount }</WorksitesCell>
      <WorksitesCell small={small}>{ pastParticipantCount }</WorksitesCell>
      <WorksitesCell small={small}>{ totalHours }</WorksitesCell>
    </Row>
  );
};

TableRow.defaultProps = {
  selected: false,
  small: false
};

export default TableRow;
