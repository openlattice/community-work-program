// @flow
import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  CardSegment,
  Colors,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  StyleUtils,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { expandIcon } from '../../stats/styled/ExpansionStyles';
import { getWeeklyBreakdownOfHoursPerWeek } from '../utils/CheckInUtils';

const { getStyleVariation } = StyleUtils;
const { NEUTRALS } = Colors;

const numHoursColorVariation = getStyleVariation('hours', {
  default: NEUTRALS[0],
  '0 hrs': NEUTRALS[2],
});

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

const NumHours = styled.div`
  color: ${numHoursColorVariation};
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
            <CardSegment padding="0">
              {
                weeklyHoursBreakdown.map((weekMap :Map) => {
                  const hours = `${weekMap.get('hours')} hrs`;
                  return (
                    <WeeklyHoursRow key={weekMap.get('weekStart')}>
                      <div>{ getHoursString(weekMap) }</div>
                      <NumHours hours={hours.toString()}>{ hours }</NumHours>
                    </WeeklyHoursRow>
                  );
                })
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
