// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editAppointment } from '../ParticipantActions';
import { schema, uiSchema } from './schemas/EditAppointmentSchemas';
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_END,
  INCIDENT_START_DATETIME
} from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityData,
} = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;

const getInfoFromTimeRange = (timeString :string) :Object => {
  const start :string = timeString.split('-')[0].trim().split(':').join(' ');
  const end :string = timeString.split('-')[1].trim().split(':').join(' ');
  return { start, end };
};

const get24HourTimeFromString = (timeString :string) :string => {
  /* https://moment.github.io/luxon/docs/manual/parsing.html#table-of-tokens */
  const inputFormat :string = 'h mm a';
  const time :DateTime = DateTime.fromFormat(timeString, inputFormat).toLocaleString(DateTime.TIME_SIMPLE);
  const timeIn24Hour :string = time.toLowerCase().split(' ').join('');
  return timeIn24Hour;
};

const getDateInISOFormat = (dateString :string) => (
  DateTime.fromFormat(dateString.split('/').join(' '), 'M d yyyy').toISODate()
);

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
          formContext={{}}
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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    editAppointment,
  }, dispatch)
});


// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditAppointmentForm);
