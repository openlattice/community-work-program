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
import { APP, STATE, WORK_SCHEDULE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES_MAP } from '../../core/edm/constants/DataModelConsts';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const {
  ACTIONS,
  APPOINTMENTS,
  COURT_TYPE_BY_APPOINTMENT_EKID,
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
  personCourtType: 'Court Type',
  hours: 'Hours',
});
const appointmentLabelMap :OrderedMap = OrderedMap({
  day: EMPTY_STRING,
  date: EMPTY_STRING,
  personName: EMPTY_STRING,
  worksiteName: EMPTY_STRING,
  personCourtType: EMPTY_STRING,
  hours: EMPTY_STRING,
});
const headerDataMap :Map = Map({
  day: SPACED_STRING,
  date: SPACED_STRING,
  personName: SPACED_STRING,
  worksiteName: SPACED_STRING,
  personCourtType: SPACED_STRING,
  hours: SPACED_STRING,
});

type Props = {
  actions:{
    findAppointments :RequestSequence;
  };
  appointments :List;
  courtTypeByAppointmentEKID :Map;
  entitySetIds :Map;
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
      entitySetIds,
      match: {
        params: { date: selectedDate, timeframe: timePeriod }
      },
    } = this.props;
    if (entitySetIds.has(APPOINTMENT)) {
      actions.findAppointments({ selectedDate, timePeriod });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIds,
      match: {
        params: { date: selectedDate, timeframe: timePeriod }
      },
    } = this.props;
    if (!prevProps.entitySetIds.has(APPOINTMENT) && entitySetIds.has(APPOINTMENT)) {
      actions.findAppointments({ selectedDate, timePeriod });
    }
  }

  sortAppointmentsByDate = (appointments :List) => (
    sortEntitiesByDateProperty(appointments, [INCIDENT_START_DATETIME])
  );

  render() {
    const {
      appointments,
      courtTypeByAppointmentEKID,
      findAppointmentsRequestState,
      initializeApplicationRequestState,
      match: {
        params: { courtType, worksites }
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
      const personCourtType :string = courtTypeByAppointmentEKID.get(appointmentEKID, '');
      const selectedCourtType :string = courtType ? COURT_TYPES_MAP[courtType] : '';
      if ((worksiteNames.includes(worksiteName) || !worksiteNames.length)
        && personCourtType === selectedCourtType) return true;
      if (!worksiteNames.length) return true;
      return false;
    });
    return (
      <Card>
        <CardSegment padding="sm" vertical>
          Work Schedule
        </CardSegment>
        <CardSegment padding="sm">
          <DataGrid
              columns={6}
              data={headerDataMap}
              labelMap={headerLabelMap} />
        </CardSegment>
        {
          filteredAppointments.map((appointment :Map) => {
            const appointmentEKID :UUID = getEntityKeyId(appointment);
            const worksiteName :string = worksiteNamesByAppointmentEKID.get(appointmentEKID);
            const personCourtType :string = courtTypeByAppointmentEKID.get(appointmentEKID, EMPTY_FIELD);
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
              personCourtType,
              hours,
            });
            return (
              <CardSegment key={appointmentEKID} padding="sm">
                <DataGrid
                    columns={6}
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
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [APPOINTMENTS]: workSchedule.get(APPOINTMENTS),
    [COURT_TYPE_BY_APPOINTMENT_EKID]: workSchedule.get(COURT_TYPE_BY_APPOINTMENT_EKID),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
    [WORKSITE_NAMES_BY_APPOINTMENT_EKID]: workSchedule.get(WORKSITE_NAMES_BY_APPOINTMENT_EKID),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    findAppointmentsRequestState: workSchedule.getIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE]),
    initializeApplicationRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    findAppointments,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PrintWorkScheduleContainer);
