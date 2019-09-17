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

import {
  DATETIME_END,
  INCIDENT_START_DATETIME,
  PEOPLE_FQNS,
  WORKSITE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../../utils/DataUtils';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { NAME } = WORKSITE_FQNS;

const headerLabelMap :OrderedMap = OrderedMap({
  worksiteName: 'Worksite',
  day: 'Weekday',
  date: 'Date',
  hours: 'Hours',
});

const appointmentLabelMap :OrderedMap = OrderedMap({
  worksiteName: '',
  day: '',
  date: '',
  hours: '',
});

type Props = {
  participant :Map;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

type State = {
  appointments :List;
  appointmentsByWorksiteName :Map;
};

class PrintWorkScheduleContainer extends Component<Props, State> {

  state = {
    appointments: List(),
    appointmentsByWorksiteName: Map(),
  };

  componentDidMount() {
    this.setAppointments();
    this.setWorksiteNames();
  }

  setAppointments = () => {
    const { workAppointmentsByWorksitePlan } = this.props;

    let appointments :List = List().withMutations((list :List) => {

      workAppointmentsByWorksitePlan.forEach((appointmentsList :List) => {
        appointmentsList.forEach((appointment :Map) => {
          list.push(appointment);
        });
      });
    });

    appointments = sortEntitiesByDateProperty(appointments, INCIDENT_START_DATETIME);
    this.setState({ appointments });
  }

  setWorksiteNames = () => {
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

    this.setState({ appointmentsByWorksiteName });
  }

  render() {
    const {
      participant,
    } = this.props;
    const { appointments, appointmentsByWorksiteName } = this.state;

    const {
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName
    } = getEntityProperties(participant, [FIRST_NAME, LAST_NAME]);
    const personFullName = `${firstName} ${lastName}`;

    return (
      <Card>
        <CardSegment padding="sm" vertical>
          { personFullName } Schedule
        </CardSegment>
        <CardSegment padding="sm">
          <DataGrid
              columns={4}
              data={fromJS({
                worksiteName: ' ',
                day: ' ',
                date: ' ',
                hours: ' ',
              })}
              labelMap={headerLabelMap} />
        </CardSegment>
        {
          appointments.map((appointment :Map) => {
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
