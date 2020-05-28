// @flow
import React, { Component } from 'react';
import { List, Map, fromJS } from 'immutable';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editAppointment } from '../assignedworksites/WorksitePlanActions';
import { schema, uiSchema } from './schemas/EditAppointmentSchemas';
import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import {
  get24HourTimeFromString,
  getCombinedDateTime,
  getDateInISOFormat,
  getInfoFromTimeRange,
} from '../../../utils/ScheduleUtils';
import { hydrateSchema } from '../utils/EditAppointmentUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { APP, EDM, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityData,
} = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;
const { DATETIME_END, INCIDENT_START_DATETIME } = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

type Props = {
  actions:{
    editAppointment :RequestSequence;
  },
  app :Map;
  assignedWorksites :List;
  entitySetIds :Map;
  appointment :Object;
  appointmentEKID :UUID;
  personName :string;
  propertyTypeIds :Map;
};

type State = {
  formData :Object;
  updatedSchema :Object;
}

class EditAppointmentForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
      updatedSchema: schema,
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  prepopulateFormData = () => {
    const { appointment, assignedWorksites, personName } = this.props;

    const rawDateString = appointment.get('day').split(' ')[1];
    const date = getDateInISOFormat(rawDateString);
    const hours = appointment.get('hours');
    const { start, end } = getInfoFromTimeRange(hours);
    const startTime :string = get24HourTimeFromString(start);
    const endTime :string = get24HourTimeFromString(end);

    const hydratedSchema = assignedWorksites ? hydrateSchema(schema, assignedWorksites) : schema;

    const formData :{} = {
      [getPageSectionKey(1, 1)]: {
        person: appointment.get('personName') || personName,
        worksite: appointment.get('worksiteName'),
        date,
        startTime,
        endTime,
      }
    };
    this.setState({ formData, updatedSchema: hydratedSchema });
  }

  handleOnChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      app,
      entitySetIds,
      appointmentEKID,
      propertyTypeIds,
    } = this.props;

    let formDataToProcess :Map = fromJS({
      [getPageSectionKey(1, 1)]: {}
    });

    const startDateTime :string = getCombinedDateTime(
      formData[getPageSectionKey(1, 1)].date,
      formData[getPageSectionKey(1, 1)].startTime
    );
    const endDateTime :string = getCombinedDateTime(
      formData[getPageSectionKey(1, 1)].date,
      formData[getPageSectionKey(1, 1)].endTime
    );

    formDataToProcess = formDataToProcess.setIn([
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, APPOINTMENT, INCIDENT_START_DATETIME)
    ], startDateTime);
    formDataToProcess = formDataToProcess.setIn([
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, APPOINTMENT, DATETIME_END)
    ], endDateTime);

    const processedData = processEntityData(formDataToProcess, entitySetIds, propertyTypeIds);

    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const entityData :{} = {
      [appointmentESID]: {
        [appointmentEKID]: processedData[appointmentESID][0],
      }
    };
    actions.editAppointment({ entityData });
  }

  render() {
    const { formData, updatedSchema } = this.state;
    return (
      <Form
          formData={formData}
          onChange={this.handleOnChange}
          onSubmit={this.handleOnSubmit}
          schema={updatedSchema}
          uiSchema={uiSchema} />
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    app,
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editAppointment,
  }, dispatch)
});


// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditAppointmentForm);
