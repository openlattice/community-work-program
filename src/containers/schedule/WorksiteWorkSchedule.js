// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';

import WorkSchedule from './WorkSchedule';

import { scheduleMenu } from '../../utils/constants/GeneralConsts';

type Props = {
  worksite :Map;
};

class WorksiteWorkSchedule extends Component<Props> {

  componentDidMount() {
    // call saga to get worksite appointments
  }

  render() {
    return (
      <WorkSchedule
          scheduleViews={scheduleMenu} />
    );
  }
}

export default WorksiteWorkSchedule;


/* PLAN:
Get appointments via a saga for all appointments for current worksite
  - Possibly filter for only upcoming appointments in the saga
Create an "organize" function that organizes the appointments based on what the menu displays are
  -> creates a new Map with each key being the menu item name and each value a List of relevant appointments
Pass down map of appointment Lists to WorkSchedule
*/
