// @flow
import React, { Component } from 'react';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import LogoLoader from '../../components/LogoLoader';

import { findAppointments } from './WorkScheduleActions';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { isDefined } from '../../utils/LangUtils';
import { APP, STATE, WORK_SCHEDULE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  APPOINTMENTS,
  FIND_APPOINTMENTS,
  PERSON_BY_APPOINTMENT_EKID,
  REQUEST_STATE,
  WORKSITE_NAMES_BY_APPOINTMENT_EKID,
} = WORK_SCHEDULE;

const { APPOINTMENT } = APP_TYPE_FQNS;
const { DATETIME_END, INCIDENT_START_DATETIME } = PROPERTY_TYPE_FQNS;

const EMPTY_STRING = '';
const SPACED_STRING = ' ';

const headerLabelMap :OrderedMap = OrderedMap({
  day: 'Weekday',
  date: 'Date',
  personName: 'Participant',
  worksiteName: 'Worksite',
  hours: 'Hours',
});
const appointmentLabelMap :OrderedMap = OrderedMap({
  day: EMPTY_STRING,
  date: EMPTY_STRING,
  personName: EMPTY_STRING,
  worksiteName: EMPTY_STRING,
  hours: EMPTY_STRING,
});
const headerDataMap :Map = Map({
  day: SPACED_STRING,
  date: SPACED_STRING,
  personName: SPACED_STRING,
  worksiteName: SPACED_STRING,
  hours: SPACED_STRING,
});

type Props = {
  actions:{
    findAppointments :RequestSequence;
  };
  app :Map;
  appointments :List;
  findAppointmentsRequestState :RequestState;
  initializeApplicationRequestState :RequestState;
  match :Match;
  personByAppointmentEKID :Map;
  worksiteNamesByAppointmentEKID :Map;
};

class PrintWorkScheduleContainer extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      app,
      match: {
        params: { date: selectedDate, timeframe: timePeriod }
      },
    } = this.props;
    if (app.get(APPOINTMENT)) {
      actions.findAppointments({ selectedDate, timePeriod });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      app,
      match: {
        params: { date: selectedDate, timeframe: timePeriod }
      },
    } = this.props;
    if (!prevProps.app.get(APPOINTMENT) && app.get(APPOINTMENT)) {
      actions.findAppointments({ selectedDate, timePeriod });
    }
  }

  sortAppointmentsByDate = (appointments :List) => (
    sortEntitiesByDateProperty(appointments, [INCIDENT_START_DATETIME])
  );

  render() {
    const {
      appointments,
      findAppointmentsRequestState,
      initializeApplicationRequestState,
      match: {
        params: { worksites }
      },
      personByAppointmentEKID,
      worksiteNamesByAppointmentEKID,
    } = this.props;

    if (initializeApplicationRequestState === RequestStates.PENDING
        || findAppointmentsRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const sortedAppointments :List = this.sortAppointmentsByDate(appointments);
    let worksiteNames :string[] = [];
    if (worksites !== undefined && worksites !== null && worksites !== 'all') {
      worksiteNames = worksites.split(',');
    }
    const filteredAppointments :List = sortedAppointments.filter((appointment :Map) => {
      const appointmentEKID :UUID = getEntityKeyId(appointment);
      const worksiteName :string = worksiteNamesByAppointmentEKID.get(appointmentEKID);
      if (!worksiteNames.length) return true;
      if (worksiteNames.includes(worksiteName)) return true;
      return false;
    });
    return (
      <Card>
        <CardSegment padding="sm" vertical>
          Work Schedule
        </CardSegment>
        <CardSegment padding="sm">
          <DataGrid
              columns={5}
              data={headerDataMap}
              labelMap={headerLabelMap} />
        </CardSegment>
        {
          filteredAppointments.map((appointment :Map) => {
            const appointmentEKID :UUID = getEntityKeyId(appointment);
            const worksiteName :string = worksiteNamesByAppointmentEKID.get(appointmentEKID);
            const person :Map = personByAppointmentEKID.get(appointmentEKID);
            const personName :string = getPersonFullName(person);

            const {
              [DATETIME_END]: datetimeEnd,
              [INCIDENT_START_DATETIME]: datetimeStart
            } = getEntityProperties(appointment, [DATETIME_END, INCIDENT_START_DATETIME]);

            const startDateObj :DateTime = DateTime.fromISO(datetimeStart);
            const day :string = startDateObj.weekdayShort;
            const date :string = startDateObj.toLocaleString(DateTime.DATE_SHORT);
            const startTime :string = startDateObj.toLocaleString(DateTime.TIME_SIMPLE);
            const endTime :string = DateTime.fromISO(datetimeEnd).toLocaleString(DateTime.TIME_SIMPLE);
            const hours :string = `${startTime} - ${endTime}`;

            const data = fromJS({
              day,
              date,
              personName,
              worksiteName,
              hours,
            });
            return (
              <CardSegment key={appointmentEKID} padding="sm">
                <DataGrid
                    columns={5}
                    data={data}
                    labelMap={appointmentLabelMap} />
              </CardSegment>
            );
          })
        }
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  const app = state.get(STATE.APP);
  const workSchedule = state.get(STATE.WORK_SCHEDULE);
  return {
    app,
    [APPOINTMENTS]: workSchedule.get(APPOINTMENTS),
    findAppointmentsRequestState: workSchedule.getIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE]),
    initializeApplicationRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
    [WORKSITE_NAMES_BY_APPOINTMENT_EKID]: workSchedule.get(WORKSITE_NAMES_BY_APPOINTMENT_EKID),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    findAppointments,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PrintWorkScheduleContainer);
