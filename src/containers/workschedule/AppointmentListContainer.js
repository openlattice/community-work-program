// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { connect } from 'react-redux';
import { SearchResults } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AppointmentContainer from './AppointmentContainer';
import NoAppointmentsScheduled from './NoAppointmentsScheduled';

import { isDefined, isNonEmptyArray } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_PLANS, STATE } from '../../utils/constants/ReduxStateConsts';
import { ALL, EMPTY_FIELD } from '../participants/ParticipantsConstants';
import { COURT_TYPES_MAP } from '../../core/edm/constants/DataModelConsts';

const {
  DATETIME_END,
  ENTITY_KEY_ID,
  FIRST_NAME,
  INCIDENT_START_DATETIME,
  LAST_NAME,
} = PROPERTY_TYPE_FQNS;
const { ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE } = WORKSITE_PLANS;

const OuterWrapper = styled.div`
  width: 100%;
`;

type Props = {
  appointments :List;
  courtTypeByAppointmentEKID :?Map;
  courtTypeToShow :?string;
  editAppointmentsRequestState :RequestState;
  hasSearched :boolean;
  isLoading :boolean;
  personByAppointmentEKID ?:Map;
  sortedByPersonLastName :boolean;
  worksiteNamesByAppointmentEKID :Map;
  worksitesToInclude ?:Object[];
};

type State = {
  fullWorkAppointments :List;
};

class AppointmentListContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      fullWorkAppointments: List(),
    };
  }

  static defaultProps = {
    courtTypeToShow: undefined,
    courtTypeByAppointmentEKID: undefined,
    personByAppointmentEKID: undefined,
    worksitesToInclude: undefined,
  };

  componentDidUpdate(prevProps :Props) {
    const {
      appointments,
      courtTypeToShow,
      editAppointmentsRequestState,
      isLoading
    } = this.props;
    if (!prevProps.appointments.equals(appointments)
      || prevProps.courtTypeToShow !== courtTypeToShow
      || (prevProps.isLoading && !isLoading)
      || (prevProps.editAppointmentsRequestState === RequestStates.PENDING
        && editAppointmentsRequestState !== RequestStates.PENDING)) {
      const sortedAppointments :List = this.sortAppointmentsByDate(appointments);
      this.setFullWorkAppointments(sortedAppointments);
    }
  }

  sortAppointmentsByDate = (appointments :List) => (
    sortEntitiesByDateProperty(appointments, [INCIDENT_START_DATETIME])
  );

  filterByCourtType = (appointments :List) => {
    const { courtTypeByAppointmentEKID, courtTypeToShow } = this.props;
    if (!isDefined(courtTypeToShow) || !isDefined(courtTypeByAppointmentEKID)) return appointments;
    if (courtTypeToShow === ALL) return appointments;
    const selectedFilter = COURT_TYPES_MAP[courtTypeToShow];
    const filteredAppointments :List = appointments.filter((appointment :Map) => {
      const appointmentEKID :UUID = getEntityKeyId(appointment);
      const courtType :String = courtTypeByAppointmentEKID.get(appointmentEKID, '');
      return courtType === selectedFilter;
    });
    return filteredAppointments;
  }

  setFullWorkAppointments = (appointments :List) => {
    const {
      courtTypeByAppointmentEKID,
      personByAppointmentEKID,
      worksiteNamesByAppointmentEKID
    } = this.props;
    let { worksitesToInclude } = this.props;

    if (isDefined(worksitesToInclude)) {
      worksitesToInclude = worksitesToInclude.map((option :Object) => option.label);
    }

    let fullWorkAppointments :List = List();
    const filteredAppointments :List = this.filterByCourtType(appointments);
    filteredAppointments.forEach((appointmentEntity :Map) => {

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

      let personName :string = '';
      if (isDefined(personByAppointmentEKID)) {
        // $FlowFixMe
        const person :Map = personByAppointmentEKID.get(appointmentEKID);
        const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(person, [FIRST_NAME, LAST_NAME]);
        personName = `${firstName} ${lastName}`;
      }
      const worksiteName :string = worksiteNamesByAppointmentEKID.get(appointmentEKID, EMPTY_FIELD);
      let courtType :string = '';
      if (isDefined(courtTypeByAppointmentEKID)) {
        courtType = courtTypeByAppointmentEKID.get(appointmentEKID, EMPTY_FIELD);
      }

      if (isNonEmptyArray(worksitesToInclude) && !worksitesToInclude.includes(worksiteName)) {
        return;
      }

      const fullWorkAppointment :OrderedMap = fromJS({
        [ENTITY_KEY_ID]: appointmentEKID,
        day,
        hours,
        personName,
        worksiteName,
        courtType,
      });
      fullWorkAppointments = fullWorkAppointments.push(fullWorkAppointment);
    });
    this.setState({ fullWorkAppointments });
  }

  render() {
    const { hasSearched, isLoading, sortedByPersonLastName } = this.props;
    const { fullWorkAppointments } = this.state;
    let appointmentsToDisplay = fullWorkAppointments;
    if (sortedByPersonLastName) {
      appointmentsToDisplay = appointmentsToDisplay
        .sortBy((appointment) => appointment.get('personName').split(' ')[1]);
    }
    return (
      <OuterWrapper>
        <SearchResults
            hasSearched={hasSearched}
            isLoading={isLoading}
            noResults={NoAppointmentsScheduled}
            resultComponent={AppointmentContainer}
            results={appointmentsToDisplay} />
      </OuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  return ({
    editAppointmentsRequestState: worksitePlans.getIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE]),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(AppointmentListContainer);
