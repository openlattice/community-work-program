// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { faCalendarWeek, faRedo } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  OrderedMap,
  fromJS
} from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  DataGrid,
  DatePicker,
  IconButton,
  Label,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../../utils/DataUtils';

const { NEUTRAL } = Colors;
const {
  DATETIME_END,
  FIRST_NAME,
  INCIDENT_START_DATETIME,
  LAST_NAME,
  NAME,
} = PROPERTY_TYPE_FQNS;

const EMPTY_STRING = '';
const SPACED_STRING = ' ';

const headerLabelMap :OrderedMap = OrderedMap({
  worksiteName: 'Worksite',
  day: 'Weekday',
  date: 'Date',
  hours: 'Hours',
});
const appointmentLabelMap :OrderedMap = OrderedMap({
  worksiteName: EMPTY_STRING,
  day: EMPTY_STRING,
  date: EMPTY_STRING,
  hours: EMPTY_STRING,
});
const headerDataMap :Map = Map({
  worksiteName: SPACED_STRING,
  day: SPACED_STRING,
  date: SPACED_STRING,
  hours: SPACED_STRING,
});

const NameAndButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const DatePickersRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

const DatePickersWrapper = styled.div`
  display: grid;
  grid-template-columns: 216px 216px 56px;
  grid-gap: 0 10px;
`;

type Props = {
  participant :Map;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

type State = {
  appointments :List;
  appointmentsByWorksiteName :Map;
  datePickersVisible :boolean;
  startDate :string;
  endDate :string;
};

class PrintWorkScheduleContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const appointments = this.getAppointments();
    const appointmentsByWorksiteName = this.getWorksiteNames();
    this.state = {
      appointments,
      appointmentsByWorksiteName,
      datePickersVisible: false,
      startDate: '',
      endDate: '',
    };
  }

  getAppointments = () => {
    const { workAppointmentsByWorksitePlan } = this.props;

    let appointments :List = List().withMutations((list :List) => {

      workAppointmentsByWorksitePlan.forEach((appointmentsList :List) => {
        appointmentsList.forEach((appointment :Map) => {
          list.push(appointment);
        });
      });
    });

    appointments = sortEntitiesByDateProperty(appointments, [INCIDENT_START_DATETIME]);
    return appointments;
  }

  getWorksiteNames = () => {
    const { workAppointmentsByWorksitePlan, worksitesByWorksitePlan } = this.props;

    let appointmentsByWorksiteName :Map = Map();
    workAppointmentsByWorksitePlan.forEach((appointmentsList :Map, worksitePlanEKID :UUID) => {

      const worksite :Map = worksitesByWorksitePlan.get(worksitePlanEKID);
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      appointmentsList.forEach((appointment :Map) => {
        const appointmentEKID :UUID = getEntityKeyId(appointment);
        appointmentsByWorksiteName = appointmentsByWorksiteName.set(appointmentEKID, worksiteName);
      });
    });

    return appointmentsByWorksiteName;
  }

  showDatePickers = () => {
    const { datePickersVisible } = this.state;
    this.setState({ datePickersVisible: !datePickersVisible });
  }

  setStartDate = (date :string) => {
    this.setState({ startDate: date });
  }

  setEndDate = (date :string) => {
    this.setState({ endDate: date });
  }

  resetDateRange = () => {
    this.setState({ startDate: '', endDate: '' });
  }

  filterAppointments = () => {
    const { appointments, endDate, startDate } = this.state;
    if (!startDate && !endDate) return appointments;
    let filteredAppointments :List = appointments;
    filteredAppointments = appointments.filter((appointment :Map) => {
      const {
        [DATETIME_END]: datetimeEnd,
        [INCIDENT_START_DATETIME]: datetimeStart
      } = getEntityProperties(appointment, [DATETIME_END, INCIDENT_START_DATETIME]);
      const apptStartAsDateTime :DateTime = DateTime.fromISO(datetimeStart);
      const apptEndAsDateTime :DateTime = DateTime.fromISO(datetimeEnd);
      const rangeStartDateTime :DateTime = DateTime.fromISO(startDate);
      const rangeEndDateTime :DateTime = DateTime.fromSQL(`${endDate} 23:59`);
      // $FlowFixMe
      const appointmentIsAfterRangeStart :boolean = apptStartAsDateTime > rangeStartDateTime;
      if (!appointmentIsAfterRangeStart) return false;
      if (!endDate) return true;
      // $FlowFixMe
      const appointmentIsBeforeRangeEnd :boolean = apptEndAsDateTime < rangeEndDateTime;
      if (!appointmentIsBeforeRangeEnd) return false;
      return true;
    });
    return filteredAppointments;
  }

  render() {
    const { participant } = this.props;
    const {
      appointmentsByWorksiteName,
      datePickersVisible,
      endDate,
      startDate,
    } = this.state;

    const {
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName
    } = getEntityProperties(participant, [FIRST_NAME, LAST_NAME]);
    const personFullName = `${firstName} ${lastName} `;
    const filteredAppointments :List = this.filterAppointments();
    return (
      <Card>
        <CardSegment padding="sm">
          <NameAndButtonRow>
            <div>
              { personFullName }
              Schedule
            </div>
            <IconButton onClick={this.showDatePickers}>
              <FontAwesomeIcon icon={faCalendarWeek} color={NEUTRAL.N500} />
            </IconButton>
          </NameAndButtonRow>
          {
            datePickersVisible && (
              <DatePickersRow>
                <Label>Date Range:</Label>
                <DatePickersWrapper>
                  <DatePicker onChange={this.setStartDate} value={startDate} />
                  <DatePicker onChange={this.setEndDate} value={endDate} />
                  <IconButton onClick={this.resetDateRange}>
                    <FontAwesomeIcon icon={faRedo} color={NEUTRAL.N500} />
                  </IconButton>
                </DatePickersWrapper>
              </DatePickersRow>
            )
          }
        </CardSegment>
        <CardSegment padding="sm">
          <DataGrid
              columns={4}
              data={headerDataMap}
              labelMap={headerLabelMap} />
        </CardSegment>
        {
          filteredAppointments.map((appointment :Map) => {
            const appointmentEKID :UUID = getEntityKeyId(appointment);
            const worksiteName :string = appointmentsByWorksiteName.get(appointmentEKID);

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
              worksiteName,
              day,
              date,
              hours,
            });
            return (
              <CardSegment key={appointmentEKID} padding="sm">
                <DataGrid
                    columns={4}
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

export default PrintWorkScheduleContainer;
