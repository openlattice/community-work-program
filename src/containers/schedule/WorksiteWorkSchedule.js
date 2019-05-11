// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';

import WorkSchedule from './WorkSchedule';

import { PERSON, scheduleMenu } from '../../utils/constants/GeneralConsts';
import { apptMap } from '../worksites/FakeData';

type Props = {
  worksite :Map;
};

class WorksiteWorkSchedule extends Component<Props> {

  componentDidMount() {
    // call saga to get worksite appointments
  }

  // filterOutPastAppointments = (apptsList :List) => {
  //   const today = DateTime.local();
  //   return apptsList.filter((appt :Map) => (
  //     DateTime.fromISO(appt.get('datetimestart')) > today
  //   ));
  // }

  // sortAppointmentsByDate = () => {
  //   const sortedAppointments = appts.sort((appt1, appt2) => {
  //     const datetime1 = appt1.get('datetimestart');
  //     const datetime2 = appt2.get('datetimestart');
  //     if (datetime1 < datetime2) {
  //       return -1;
  //     }
  //     if (datetime1 > datetime2) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  //   return sortedAppointments;
  // }

  render() {
    return (
      <WorkSchedule
          appointments={apptMap}
          display={PERSON}
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
