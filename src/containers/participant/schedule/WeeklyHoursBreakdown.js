// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  CardSegment,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from 'lattice-ui-kit';

import { getWeeklyBreakdownOfHoursPerWeek } from '../utils/CheckInUtils';
import { expandIcon } from '../../stats/styled/ExpansionStyles';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';

const getHoursString = (weekMap :Map) => {
  const weekStartDate = DateTime.fromISO(weekMap.get('weekStart')).toLocaleString(DateTime.DATE_SHORT);
  const weekEndDate = DateTime.fromISO(weekMap.get('weekEnd')).toLocaleString(DateTime.DATE_SHORT);
  return `${weekStartDate} - ${weekEndDate}`;
};

const OuterWrapper = styled.div`
  margin-bottom: 30px;
  width: 100%;
`;

const WeeklyHoursRow = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  margin-bottom: 5px;
  width: 100%;
`;

type Props = {
  appointments :List;
  checkInsByAppointment :Map;
};

const WeeklyHoursBreakdown = ({ appointments, checkInsByAppointment } :Props) => {

  const checkIns :List = List().withMutations((list :List) => {
    appointments.forEach((appointment :Map) => {
      const checkIn = checkInsByAppointment.get(getEntityKeyId(appointment));
      if (isDefined(checkIn)) list.push(checkIn);
    });
  });
  const weeklyHoursBreakdown :List = getWeeklyBreakdownOfHoursPerWeek(checkIns);
  return (
    <OuterWrapper>
      <div>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={expandIcon}>
            <div>Show Weekly Hours Breakdown</div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <CardSegment padding="0" vertical>
              {
                weeklyHoursBreakdown.map((weekMap :Map) => (
                  <WeeklyHoursRow key={weekMap.get('weekStart')}>
                    <div>{ getHoursString(weekMap) }</div>
                    <div>{ `${weekMap.get('hours')} hrs` }</div>
                  </WeeklyHoursRow>
                ))
              }
            </CardSegment>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </OuterWrapper>
  );
};

// $FlowFixMe
export default WeeklyHoursBreakdown;
