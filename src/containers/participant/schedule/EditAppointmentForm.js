// @flow
import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

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
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  SHARED,
  STATE,
  WORKSITE_PLANS
} from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityData,
} = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;
const { DATETIME_END, INCIDENT_START_DATETIME, NAME } = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { EDIT_APPOINTMENT } = WORKSITE_PLANS;
const { ACTIONS, REQUEST_STATE } = SHARED;

type Props = {
  actions:{
    editAppointment :RequestSequence;
  },
  app :Map;
  editAppointmentRequestState :RequestState;
  entitySetIds :Map;
  appointment :Object;
  appointmentEKID :UUID;
  personName :string;
  propertyTypeIds :Map;
  worksitesByWorksitePlan :Map;
};

type State = {
  formData :Object;
  originalWorksitePlanEKID :UUID;
  updatedSchema :Object;
};

class EditAppointmentForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
      originalWorksitePlanEKID: '',
      updatedSchema: schema,
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  prepopulateFormData = () => {
    const { appointment, personName, worksitesByWorksitePlan } = this.props;

    const rawDateString = appointment.get('day').split(' ')[1];
    const date = getDateInISOFormat(rawDateString);
    const hours = appointment.get('hours');
    const { start, end } = getInfoFromTimeRange(hours);
    const startTime :string = get24HourTimeFromString(start);
    const endTime :string = get24HourTimeFromString(end);

    const hydratedSchema = hydrateSchema(schema, worksitesByWorksitePlan);
    const worksitePlanEKID :UUID = worksitesByWorksitePlan.findKey((worksite :Map) => {
      let worksiteName :string = '';
      if (worksite.getIn([NAME, 0]) === appointment.get('worksiteName')) {
        worksiteName = worksite.getIn([NAME, 0]);
      }
      if (worksiteName.length) return true;
      return false;
    });

    const formData :{} = {
      [getPageSectionKey(1, 1)]: {
        person: appointment.get('personName') || personName,
        worksite: worksitePlanEKID,
        date,
        startTime,
        endTime,
      }
    };
    this.setState({ formData, originalWorksitePlanEKID: worksitePlanEKID, updatedSchema: hydratedSchema });
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
    const { originalWorksitePlanEKID } = this.state;

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

    let newWorksitePlanEKID :UUID = '';
    if (originalWorksitePlanEKID !== formData[getPageSectionKey(1, 1)].worksite) {
      newWorksitePlanEKID = formData[getPageSectionKey(1, 1)].worksite;
    }
    actions.editAppointment({ appointmentEKID, entityData, newWorksitePlanEKID });
  }

  render() {
    const { editAppointmentRequestState } = this.props;
    const { formData, updatedSchema } = this.state;
    return (
      <Form
          formData={formData}
          isSubmitting={requestIsPending(editAppointmentRequestState)}
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
    editAppointmentRequestState: state
      .getIn([STATE.WORKSITE_PLANS, ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE]),
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
