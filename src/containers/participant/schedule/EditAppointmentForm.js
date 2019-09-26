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
import {
  APP_TYPE_FQNS,
  DATETIME_END,
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
