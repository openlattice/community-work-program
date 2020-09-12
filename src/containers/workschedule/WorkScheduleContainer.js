// @flow
import React, { Component } from 'react';

import startCase from 'lodash/startCase';
import styled from 'styled-components';
import { faFilter, faSortAlphaDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  CheckboxSelect,
  DatePicker,
  IconButton,
  Label,
  Select
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppointmentListContainer from './AppointmentListContainer';
import { FIND_APPOINTMENTS, findAppointments } from './WorkScheduleActions';
import { TIME_PERIOD_OPTIONS, timePeriods } from './WorkScheduleConstants';

import * as Routes from '../../core/router/Routes';
import { ContainerHeader } from '../../components/Layout';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { requestIsPending, requestIsSuccess } from '../../utils/RequestStateUtils';
import {
  APP,
  STATE,
  WORKSITES,
  WORK_SCHEDULE
} from '../../utils/constants/ReduxStateConsts';
import { ALL, COURT_TYPE_FILTER_OPTIONS } from '../participants/ParticipantsConstants';
import { formatClickedProperty } from '../participants/utils/SearchContainerUtils';
import { getWorksites } from '../worksites/WorksitesActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { WORKSITES_LIST } = WORKSITES;
const {
  ACTIONS,
  APPOINTMENTS,
  COURT_TYPE_BY_APPOINTMENT_EKID,
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
  width: ${SEARCH_CONTAINER_WIDTH}px;
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
  grid-gap: 0 15px;
  margin-right: 15px;
`;

const SelectAndLabelWrapper = styled.div`
  align-items: center;
  align-self: flex-start;
  display: flex;
  margin-bottom: 20px;
`;

const SelectWrapper = styled.div`
  margin-left: 20px;
  width: 300px;
`;

type Props = {
  actions:{
    findAppointments :RequestSequence;
    getWorksites :RequestSequence;
    goToRoute :GoToRoute;
  };
  appointments :List;
  courtTypeByAppointmentEKID :Map;
  entitySetIds :Map;
  personByAppointmentEKID :Map;
  requestStates :{
    FIND_APPOINTMENTS :RequestState;
  };
  worksiteNamesByAppointmentEKID :Map;
  worksitesList :List;
};

type State = {
  courtTypeToShow :string;
  filtersVisible :boolean;
  selectedDate :string;
  sortedByPersonLastName :boolean;
  timePeriod :string;
  worksites :Map;
};

class WorkScheduleContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const today = DateTime.local().toISODate();
    this.state = {
      courtTypeToShow: ALL,
      filtersVisible: false,
      selectedDate: today,
      sortedByPersonLastName: false,
      timePeriod: timePeriods.DAY,
      worksites: Map(),
    };
  }

  componentDidMount() {
    const { entitySetIds } = this.props;
    if (entitySetIds.has(APP_TYPE_FQNS.APPOINTMENT)) {
      this.loadDefaultSchedule();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { entitySetIds } = this.props;
    if (!prevProps.entitySetIds.has(APP_TYPE_FQNS.APPOINTMENT) && entitySetIds.has(APP_TYPE_FQNS.APPOINTMENT)) {
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
    const {
      courtTypeToShow,
      selectedDate,
      timePeriod,
      worksites
    } = this.state;

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
        .replace(':courtType', courtTypeToShow)
    );
  }

  showFilters = () => {
    const { filtersVisible } = this.state;
    this.setState({ filtersVisible: !filtersVisible });
  }

  handleCourtTypeSelect = (clickedProperty :Map) => {
    const property :string = formatClickedProperty(clickedProperty);
    this.setState({ courtTypeToShow: property });
  }

  renderFields = () => {
    const { appointments, worksitesList } = this.props;
    const { sortedByPersonLastName } = this.state;

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
        <IconButton
            disabled={appointments.isEmpty()}
            onClick={this.showFilters}>
          <FontAwesomeIcon icon={faFilter} />
        </IconButton>
        <IconButton
            disabled={appointments.isEmpty()}
            onClick={() => this.setState({ sortedByPersonLastName: !sortedByPersonLastName })}>
          <FontAwesomeIcon icon={faSortAlphaDown} />
        </IconButton>
        <Button onClick={this.goToPrintSchedule}>Print</Button>
        <Button mode="primary" onClick={this.getAppointments}>Display Appointments</Button>
      </FieldsRowWrapper>
    );
  }

  render() {
    const {
      appointments,
      courtTypeByAppointmentEKID,
      requestStates,
      personByAppointmentEKID,
      worksiteNamesByAppointmentEKID
    } = this.props;
    const {
      filtersVisible,
      courtTypeToShow,
      sortedByPersonLastName,
      worksites
    } = this.state;
    const isLoading :boolean = requestIsPending(requestStates[FIND_APPOINTMENTS]);
    const hasSearched :boolean = requestIsSuccess(requestStates[FIND_APPOINTMENTS]);
    const worksitesToInclude :Object[] | void = worksites.get('worksites');
    return (
      <ScheduleOuterWrapper>
        <ScheduleInnerWrapper>
          <HeaderWrapper>
            <ContainerHeader>Work Schedule</ContainerHeader>
          </HeaderWrapper>
          { this.renderFields() }
          {
            filtersVisible && (
              <SelectAndLabelWrapper>
                <Label>Court type:</Label>
                <SelectWrapper>
                  <Select
                      onChange={this.handleCourtTypeSelect}
                      options={COURT_TYPE_FILTER_OPTIONS}
                      placeholder="All" />
                </SelectWrapper>
              </SelectAndLabelWrapper>
            )
          }
          <AppointmentListContainer
              appointments={appointments}
              courtTypeByAppointmentEKID={courtTypeByAppointmentEKID}
              courtTypeToShow={courtTypeToShow}
              hasSearched={hasSearched}
              isLoading={isLoading}
              personByAppointmentEKID={personByAppointmentEKID}
              sortedByPersonLastName={sortedByPersonLastName}
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
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    [APPOINTMENTS]: workSchedule.get(APPOINTMENTS),
    [COURT_TYPE_BY_APPOINTMENT_EKID]: workSchedule.get(COURT_TYPE_BY_APPOINTMENT_EKID),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
    [WORKSITES_LIST]: state.getIn([STATE.WORKSITES, WORKSITES_LIST]),
    [WORKSITE_NAMES_BY_APPOINTMENT_EKID]: workSchedule.get(WORKSITE_NAMES_BY_APPOINTMENT_EKID),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    requestStates: {
      [FIND_APPOINTMENTS]: workSchedule.getIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE]),
    }
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
