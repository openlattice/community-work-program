// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { SearchResults } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import AppointmentContainer from './AppointmentContainer';
import NoAppointmentsScheduled from './NoAppointmentsScheduled';

import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';
import { DATETIME_END, ENTITY_KEY_ID, INCIDENT_START_DATETIME } from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';

const OuterWrapper = styled.div`
  width: 100%;
`;

type Props = {
  appointments :List;
  hasSearched :boolean;
  isLoading :boolean;
  personNamesByAppointmentEKID ?:Map;
  worksiteNamesByAppointmentEKID :Map;
  worksitesToInclude ?:Object[];
};

type State = {
  fullWorkAppointments :List;
};

class AppointmentListContainer extends Component<Props, State> {

  state = {
    fullWorkAppointments: List(),
  };

  componentDidUpdate(prevProps :Props) {
    const { appointments, isLoading } = this.props;
    if (prevProps.appointments.count() !== appointments.count()
      || (prevProps.isLoading && !isLoading)) {
      const sortedAppointments :List = this.sortAppointmentsByDate(appointments);
      this.setFullWorkAppointments(sortedAppointments);
    }
  }

  sortAppointmentsByDate = (appointments :List) => (
    sortEntitiesByDateProperty(appointments, INCIDENT_START_DATETIME)
  );

  setFullWorkAppointments = (appointments :List) => {
    const { personNamesByAppointmentEKID, worksiteNamesByAppointmentEKID } = this.props;
    let { worksitesToInclude } = this.props;

    if (isDefined(worksitesToInclude)) {
      worksitesToInclude = worksitesToInclude.map((option :Object) => option.label);
    }

    let fullWorkAppointments :List = List();
    appointments.forEach((appointmentEntity :Map) => {

      const {
        [DATETIME_END]: datetimeEnd,
        [INCIDENT_START_DATETIME]: datetimeStart
      } = getEntityProperties(appointmentEntity, [DATETIME_END, INCIDENT_START_DATETIME]);
      const appointmentEKID :UUID = getEntityKeyId(appointmentEntity);

      const dateObj :DateTime = DateTime.fromISO(datetimeStart);
      const day :string = `${dateObj.weekdayShort} ${dateObj.toLocaleString(DateTime.DATE_SHORT)}`;
      const startTime :string = DateTime.fromISO(datetimeStart).toLocaleString(DateTime.TIME_SIMPLE);
      const endTime :string = DateTime.fromISO(datetimeEnd).toLocaleString(DateTime.TIME_SIMPLE);
      const hours :string = `${startTime} - ${endTime}`;

      const personName :string = isDefined(personNamesByAppointmentEKID)
        ? personNamesByAppointmentEKID.get(appointmentEKID, EMPTY_FIELD)
        : '';
      const worksiteName :string = worksiteNamesByAppointmentEKID.get(appointmentEKID, EMPTY_FIELD);

      if (isDefined(worksitesToInclude) && worksitesToInclude.length) {
        if (!worksitesToInclude.includes(worksiteName)) {
          return;
        }
      }

      const fullWorkAppointment :OrderedMap = fromJS({
        [ENTITY_KEY_ID]: appointmentEKID,
        day,
        hours,
        personName,
        worksiteName,
      });
      fullWorkAppointments = fullWorkAppointments.push(fullWorkAppointment);
    });
    this.setState({ fullWorkAppointments });
  }

  render() {
    const { hasSearched, isLoading } = this.props;
    const { fullWorkAppointments } = this.state;
    return (
      <OuterWrapper>
        <SearchResults
            hasSearched={hasSearched}
            isLoading={isLoading}
            noResults={NoAppointmentsScheduled}
            resultComponent={AppointmentContainer}
            results={fullWorkAppointments} />
      </OuterWrapper>
    );
  }
}

// $FlowFixMe
AppointmentListContainer.defaultProps = {
  personNamesByAppointmentEKID: undefined,
  worksitesToInclude: undefined,
};

export default AppointmentListContainer;
