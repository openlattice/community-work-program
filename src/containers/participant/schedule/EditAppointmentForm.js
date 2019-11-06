// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editAppointment } from '../assignedworksites/WorksitePlanActions';
import { schema, uiSchema } from './schemas/EditAppointmentSchemas';
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../../utils/DataUtils';
import {
  get24HourTimeFromString,
  getCombinedDateTime,
  getDateInISOFormat,
  getInfoFromTimeRange,
} from '../../../utils/ScheduleUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityData,
} = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;
const { DATETIME_END, INCIDENT_START_DATETIME } = PROPERTY_TYPE_FQNS;

type Props = {
  actions:{
    editAppointment :RequestSequence;
  },
  app :Map;
  appointment :Object;
  appointmentEKID :UUID;
  edm :Map;
  personName :string;
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
    const { appointment, personName } = this.props;

    const rawDateString = appointment.get('day').split(' ')[1];
    const date = getDateInISOFormat(rawDateString);
    const hours = appointment.get('hours');
    const { start, end } = getInfoFromTimeRange(hours);
    const startTime :string = get24HourTimeFromString(start);
    const endTime :string = get24HourTimeFromString(end);

    const formData :{} = {
      [getPageSectionKey(1, 1)]: {
        person: appointment.get('personName') || personName,
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

  handleOnChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  handleOnSubmit = ({ formData } :Object) => {
    const { actions, app, appointmentEKID } = this.props;

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

    const entitySetIds :{} = this.createEntitySetIdsMap();
    const propertyTypeIds :{} = this.createPropertyTypeIdsMap();
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
    const { formData } = this.state;
    return (
      <Form
          formData={formData}
          onChange={this.handleOnChange}
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

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editAppointment,
  }, dispatch)
});


// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditAppointmentForm);
