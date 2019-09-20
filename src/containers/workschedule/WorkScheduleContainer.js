// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  CardSegment,
  CheckboxSelect,
  DatePicker,
  Label,
  Select
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import ParticipantWorkSchedule from '../participant/schedule/ParticipantWorkSchedule';

import { findAppointments } from './WorkScheduleActions';
import { ContainerHeader } from '../../components/Layout';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { timePeriods } from './WorkScheduleConstants';

const { WORKSITES_LIST } = WORKSITES;

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
  min-width: ${SEARCH_CONTAINER_WIDTH}px;
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

type Props = {
  actions:{
    findAppointments :RequestSequence;
  };
  app :Map;
  worksitesList :List;
};

class WorkScheduleContainer extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { app, actions } = this.props;
    if (!prevProps.app.get(APP_TYPE_FQNS.APPOINTMENT) && app.get(APP_TYPE_FQNS.APPOINTMENT)) {
      const today = DateTime.local().toISODate();
      actions.findAppointments({ selectedDate: today, timePeriod: timePeriods.DAY });
    }
  }

  renderFields = () => {
    return (
      <FieldsRowWrapper>
        <FieldsWrapper>
          <div>
            <Label>Date</Label>
            <DatePicker
                onChange={date => console.log(date)} />
          </div>
          <div>
            <Label>Time Period</Label>
            <Select
                id="timePeriod"
                name="Time Period"
                onChange={() => {}}
                options={[
                  { label: 'Day', value: 'Day' },
                  { label: 'Week', value: 'Week' },
                  { label: 'Month', value: 'Month' }
                ]} />
          </div>
          <div>
            <Label>Work Site</Label>
            <CheckboxSelect
                id="worksite"
                name="Work Site"
                onChange={() => {}}
                options={[
                  { label: 'Garden', value: 'Garden' },
                  { label: 'B&G', value: 'B&G' },
                  { label: '24/7', value: '24/7' }
                ]} />
          </div>
        </FieldsWrapper>
        <Button mode="primary" onClick={() => {}}>Display Appointments</Button>
      </FieldsRowWrapper>
    );
  }

  render() {
    return (
      <ScheduleOuterWrapper>
        <ScheduleInnerWrapper>
          <HeaderWrapper>
            <ContainerHeader>Work Schedule</ContainerHeader>
          </HeaderWrapper>
          { this.renderFields() }
          <ParticipantWorkSchedule
              workAppointmentsByWorksitePlan={Map()}
              worksiteNamesByWorksitePlan={Map()} />
        </ScheduleInnerWrapper>
      </ScheduleOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  return ({
    app,
    [WORKSITES_LIST]: state.getIn([STATE.WORKSITES, WORKSITES_LIST]),
  });
};

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    findAppointments,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorkScheduleContainer);
