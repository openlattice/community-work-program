// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import startCase from 'lodash/startCase';
import { DateTime } from 'luxon';
import {
  Button,
  CheckboxSelect,
  DatePicker,
  Label,
  Select
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppointmentListContainer from './AppointmentListContainer';
import * as Routes from '../../core/router/Routes';

import { findAppointments } from './WorkScheduleActions';
import { getWorksites } from '../worksites/WorksitesActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { ContainerHeader } from '../../components/Layout';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { STATE, WORKSITES, WORK_SCHEDULE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { timePeriods, TIME_PERIOD_OPTIONS } from './WorkScheduleConstants';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { WORKSITES_LIST } = WORKSITES;
const {
  ACTIONS,
  APPOINTMENTS,
  FIND_APPOINTMENTS,
  PERSON_BY_APPOINTMENT_EKID,
  REQUEST_STATE,
  WORKSITE_NAMES_BY_APPOINTMENT_EKID,
} = WORK_SCHEDULE;
const { NAME } = PROPERTY_TYPE_FQNS;

const ScheduleOuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const ScheduleInnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;
  /* width: ${SEARCH_CONTAINER_WIDTH}px; */
  position: relative;
  align-self: center;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const FieldsRowWrapper = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  width: 100%;
`;

const FieldsWrapper = styled.div`
  display: grid;
  grid-template-columns: 200px 200px minmax(200px, auto);
  grid-gap: 0 20px;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 1fr) minmax(min-content, 1fr);
  grid-gap: 0 15px;
  margin-left: 8px;
`;

type Props = {
  actions:{
    findAppointments :RequestSequence;
    getWorksites :RequestSequence;
    goToRoute :GoToRoute;
  };
  app :Map;
  appointments :List;
  findAppointmentsRequestState :RequestState;
  personByAppointmentEKID :Map;
  worksiteNamesByAppointmentEKID :Map;
  worksitesList :List;
};

type State = {
  selectedDate :string;
  timePeriod :string;
  worksites :Map;
};

class WorkScheduleContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const today = DateTime.local().toISODate();
    this.state = {
      selectedDate: today,
      timePeriod: timePeriods.DAY,
      worksites: Map(),
    };
  }

  componentDidMount() {
    const { app } = this.props;
    if (app.get(APP_TYPE_FQNS.APPOINTMENT)) {
      this.loadDefaultSchedule();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { app } = this.props;
    if (!prevProps.app.get(APP_TYPE_FQNS.APPOINTMENT) && app.get(APP_TYPE_FQNS.APPOINTMENT)) {
      this.loadDefaultSchedule();
    }
  }

  loadDefaultSchedule = () => {
    const { actions } = this.props;
    const { selectedDate } = this.state;
    actions.findAppointments({ selectedDate, timePeriod: timePeriods.DAY });
    actions.getWorksites();
  }

  setDate = (name :string) => (date :string) => {
    this.setState({ [name]: date });
  }

  handleSelectChange = (option :Object, event :Object) => {
    const { name } = event;
    const { value } = option;
    this.setState({ [name]: value });
  }

  handleCheckboxSelectChange = (option :Object[], event :Object) => {
    const { worksites } = this.state;
    const { name } = event;
    this.setState({ worksites: worksites.set(name, option) });
  }

  getAppointments = () => {
    const { actions } = this.props;
    const { selectedDate, timePeriod } = this.state;
    actions.findAppointments({ selectedDate, timePeriod });
  }

  goToPrintSchedule = () => {
    const { actions } = this.props;
    const { selectedDate, timePeriod, worksites } = this.state;

    let worksiteNames :string = 'all';
    if (!worksites.isEmpty()) {
      const worksiteList :Object[] = worksites.get('worksites');
      worksiteNames = '';
      worksiteList.forEach((worksite :Object) => {
        worksiteNames = worksiteNames.concat(',', worksite.label);
      });
      worksiteNames = worksiteNames.slice(1); // 0th char was a comma
    }

    actions.goToRoute(
      Routes.PRINT_WORK_SCHEDULE
        .replace(':date', selectedDate)
        .replace(':timeframe', timePeriod)
        .replace(':worksites', worksiteNames)
    );
  }

  renderFields = () => {
    const { worksitesList } = this.props;

    const WORKSITES_OPTIONS :Object[] = [];
    worksitesList.forEach((worksite :Map) => {
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      const worksiteEKID :UUID = getEntityKeyId(worksite);
      WORKSITES_OPTIONS.push({ label: worksiteName, value: worksiteEKID });
    });
    return (
      <FieldsRowWrapper>
        <FieldsWrapper>
          <div>
            <Label>Date</Label>
            <DatePicker
                name="selectedDate"
                onChange={this.setDate('selectedDate')}
                placeholder={DateTime.local().toLocaleString(DateTime.DATE_SHORT)} />
          </div>
          <div>
            <Label>Time Period</Label>
            <Select
                id="timePeriod"
                name="timePeriod"
                onChange={this.handleSelectChange}
                options={TIME_PERIOD_OPTIONS}
                placeholder={startCase(timePeriods.DAY)} />
          </div>
          <div>
            <Label>Work Site</Label>
            <CheckboxSelect
                id="worksite"
                name="worksites"
                onChange={this.handleCheckboxSelectChange}
                options={WORKSITES_OPTIONS} />
          </div>
        </FieldsWrapper>
        <ButtonsWrapper>
          <Button onClick={this.goToPrintSchedule}>Print Schedule</Button>
          <Button mode="primary" onClick={this.getAppointments}>Display Appointments</Button>
        </ButtonsWrapper>
      </FieldsRowWrapper>
    );
  }

  render() {
    const {
      appointments,
      findAppointmentsRequestState,
      personByAppointmentEKID,
      worksiteNamesByAppointmentEKID
    } = this.props;
    const { worksites } = this.state;
    const isLoading :boolean = findAppointmentsRequestState === RequestStates.PENDING;
    const hasSearched :boolean = findAppointmentsRequestState === RequestStates.SUCCESS;
    const worksitesToInclude :Object[] | void = worksites.get('worksites');
    return (
      <ScheduleOuterWrapper>
        <ScheduleInnerWrapper>
          <HeaderWrapper>
            <ContainerHeader>Work Schedule</ContainerHeader>
          </HeaderWrapper>
          { this.renderFields() }
          <AppointmentListContainer
              appointments={appointments}
              hasSearched={hasSearched}
              isLoading={isLoading}
              personByAppointmentEKID={personByAppointmentEKID}
              worksiteNamesByAppointmentEKID={worksiteNamesByAppointmentEKID}
              worksitesToInclude={worksitesToInclude} />
        </ScheduleInnerWrapper>
      </ScheduleOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const workSchedule = state.get(STATE.WORK_SCHEDULE);
  return ({
    app,
    [APPOINTMENTS]: workSchedule.get(APPOINTMENTS),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
    [WORKSITES_LIST]: state.getIn([STATE.WORKSITES, WORKSITES_LIST]),
    [WORKSITE_NAMES_BY_APPOINTMENT_EKID]: workSchedule.get(WORKSITE_NAMES_BY_APPOINTMENT_EKID),
    findAppointmentsRequestState: workSchedule.getIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE]),
  });
};

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    findAppointments,
    getWorksites,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorkScheduleContainer);
