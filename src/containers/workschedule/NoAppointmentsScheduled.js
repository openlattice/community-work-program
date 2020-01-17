// @flow
import React from 'react';
import { Card, CardSegment, IconSplash } from 'lattice-ui-kit';
import { faCalendarTimes } from '@fortawesome/pro-light-svg-icons';

const NoAppointmentsScheduled = () => (
  <Card>
    <CardSegment>
      <IconSplash
          caption="No Appointments Scheduled"
          icon={faCalendarTimes}
          size="3x" />
    </CardSegment>
  </Card>
);

export default NoAppointmentsScheduled;
