// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

// import { editAppointment } from '../ParticipantActions';
import { schema, uiSchema } from './EditPersonAndContactsSchema';
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
// import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import {
  APP_TYPE_FQNS,
  DATETIME_END,
  INCIDENT_START_DATETIME
} from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';

// const {
//   getPageSectionKey,
//   getEntityAddressKey,
//   processEntityData,
// } = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;

// const getInfoFromTimeRange = (timeString :string) :Object => {
//   const start :string = timeString.split('-')[0].trim().split(':').join(' ');
//   const end :string = timeString.split('-')[1].trim().split(':').join(' ');
//   return { start, end };
// };
//
// const get24HourTimeFromString = (timeString :string) :string => {
//   /* https://moment.github.io/luxon/docs/manual/parsing.html#table-of-tokens */
//   const inputFormat :string = 'h mm a';
//   const time :DateTime = DateTime.fromFormat(timeString, inputFormat).toLocaleString(DateTime.TIME_SIMPLE);
//   const timeIn24Hour :string = time.toLowerCase().split(' ').join('');
//   return timeIn24Hour;
// };
//
// const getDateInISOFormat = (dateString :string) => (
//   DateTime.fromFormat(dateString.split('/').join(' '), 'M d yyyy').toISODate()
// );

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

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

class EditPersonAndContactsForm extends Component<Props, State> {

  state = {
    formData: {},
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  prepopulateFormData = () => {
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
  }

  render() {
    const { formData } = this.state;
    return (
      <FormWrapper>
        <Card>
          <CardHeader mode="primary" padding="sm">Edit Person Details</CardHeader>
          <Form
              formContext={{}}
              formData={formData}
              onChange={this.handleOnChange}
              onSubmit={this.handleOnSubmit}
              schema={schema}
              uiSchema={uiSchema} />
        </Card>
      </FormWrapper>
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
    // editAppointment,
  }, dispatch)
});


// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPersonAndContactsForm);
