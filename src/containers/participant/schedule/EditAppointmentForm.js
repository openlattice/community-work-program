// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { schema, uiSchema } from './schemas/EditAppointmentSchemas';
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_END,
  ENTITY_KEY_ID,
  INCIDENT_START_DATETIME
} from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityDataForPartialReplace,
  processAssociationEntityData
} = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;

type Props = {
  actions:{
    editAppointment :RequestSequence;
  },
  app :Map;
  appointment :Object;
  appointmentEKID :UUID;
  edm :Map;
};

type State = {
  formData :Object;
}

class EditAppointmentForm extends Component<Props, State> {

  state = {
    formData: {},
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  prepopulateFormData = () => {
    const { appointment } = this.props;

    const date = appointment.get('day').split(' ')[1];
    const hours = appointment.get('hours');
    const startTime = hours.split('-')[0].trim();
    const endTime = hours.split('-')[1].trim();
    const formData :{} = {
      [getPageSectionKey(1, 1)]: {
        person: appointment.get('personName'),
        worksite: appointment.get('worksiteName'),
        date,
        startTime,
        endTime,
      }
    };
    this.setState({ formData });
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [APPOINTMENT]: getEntitySetIdFromApp(app, APPOINTMENT),
    };
  };

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [INCIDENT_START_DATETIME]: getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME),
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
    };
  };

  getOriginalAppointmentData = () => {
    const { appointment } = this.props;

    const date = appointment.get('day').split(' ')[1].split('/').join(' '); // fmt: 9 25 2019
    const dateAsISODate :DateTime = DateTime.fromFormat(date, 'M dd yyyy').toISODate();
    console.log(DateTime.fromFormat(date, 'M dd yyyy'));

    const hoursSplit :string[] = appointment.get('hours').split('-');
    const startTime :string = DateTime.fromFormat(hoursSplit[0].trim(), 't');
    // console.log(DateTime.local())
    // 1:30 PM
    console.log('THING THAT SHOULD WORK------------', DateTime.fromFormat('9:07 AM', 't'));
    const endTime :string = DateTime.fromFormat(hoursSplit[1].trim(), 't').toISOTime();
    console.log('startTime: ', startTime);
    const startDateTime :string = getCombinedDateTime(dateAsISODate, startTime);
    console.log('startDateTime: ', DateTime.fromSQL(`${dateAsISODate} ${startTime}`));
    const endDateTime :string = getCombinedDateTime(dateAsISODate, endTime);

    const appointmentEKID :UUID = appointment.get(ENTITY_KEY_ID);

    const originalAppointment :Map = Map().withMutations((map) => {
      map.set(INCIDENT_START_DATETIME, startDateTime);
      map.set(DATETIME_END, endDateTime);
      map.set(ENTITY_KEY_ID, appointmentEKID);
    });
    return originalAppointment;
  }

  handleOnSubmit = ({ formData } :Object) => {

    const entitySetIds :{} = this.createEntitySetIdsMap();
    const propertyTypeIds :{} = this.createPropertyTypeIdsMap();
    // const entityData = processEntityDataForPartialReplace(formData, originalData, entitySetIds, propertyTypeIds, {});
    // actions.editAppointment({ entityData });
  }

  render() {
    const { actions } = this.props;
    const { formData } = this.state;

    const formContext :{} = {
      addActions: {
        addTaskItem: () => {}
      },
      deleteAction: () => {},
      editAction: () => {},
      entityIndexToIdMap: Map(),
      entitySetIds: this.createEntitySetIdsMap(),
      mappers: {},
      propertyTypeIds: this.createPropertyTypeIdsMap(),
    };
    console.log('formData: ', formData);
    console.log('test: ', this.getOriginalAppointmentData())
    return (
      <Form
          formContext={formContext}
          formData={formData}
          onChange={() => {}}
          onSubmit={this.handleOnSubmit}
          schema={schema}
          uiSchema={uiSchema} />
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  return ({
    app,
    edm,
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(EditAppointmentForm);
