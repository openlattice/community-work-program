// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editInfractionEvent } from '../ParticipantActions';
import { schema, uiSchema } from './schemas/EditInfractionSchemas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm,
} from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  INFRACTION_EVENT_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityDataForPartialReplace,
} = DataProcessingUtils;

const { INFRACTION_EVENT } = APP_TYPE_FQNS;
const { NOTES, TYPE } = INFRACTION_EVENT_FQNS;

const FormWrapper = styled.div`
  width: 600px;
`;

type Props = {
  actions:{
    editInfractionEvent :RequestSequence;
  },
  app :Map;
  edm :Map;
  infractionEvent :Map;
  infractionCategory :string;
};

type State = {
  formData :Object;
};

class EditInfractionForm extends Component<Props, State> {

  state = {
    formData: {},
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  prepopulateFormData = () => {
    const { infractionEvent, infractionCategory } = this.props;

    const {
      [DATETIME_COMPLETED]: infractionDateTime,
      [NOTES]: infractionNotes,
      [TYPE]: infractionType
    } = getEntityProperties(infractionEvent, [DATETIME_COMPLETED, NOTES, TYPE]);
    const infractionDate = DateTime.fromISO(infractionDateTime).toISODate();
    const infractionTime = DateTime.fromISO(infractionDateTime).toLocaleString(DateTime.TIME_24_SIMPLE);

    const formData :{} = {
      [getPageSectionKey(1, 1)]: {
        infractionCategory,
        [getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)]: infractionDate,
        time: infractionTime,
        [getEntityAddressKey(0, INFRACTION_EVENT, TYPE)]: infractionType,
        [getEntityAddressKey(0, INFRACTION_EVENT, NOTES)]: infractionNotes,
      }
    };
    this.setState({ formData });
  }

  createEntityIndexToIdMap = () => {
    const { infractionEvent } = this.props;
    const entityIndexToIdMap :Map = Map({
      [INFRACTION_EVENT]: getEntityKeyId(infractionEvent)
    });
    return entityIndexToIdMap;
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [INFRACTION_EVENT]: getEntitySetIdFromApp(app, INFRACTION_EVENT),
    };
  };

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DATETIME_COMPLETED]: getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED),
      [NOTES]: getPropertyTypeIdFromEdm(edm, NOTES),
      [TYPE]: getPropertyTypeIdFromEdm(edm, TYPE),
    };
  };

  handleOnChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  handleOnSubmit = ({ formData } :Object) => {
    const { actions, infractionEvent } = this.props;

    const infractionEventEKID :UUID = getEntityKeyId(infractionEvent);
    const pageKey :string = getPageSectionKey(1, 1);
    const dataToProcess :Object = {
      [pageKey]: {}
    };
    const dateTimeOriginalKey :string = getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED);
    const dateTimeCompleted :string = getCombinedDateTime(
      formData[pageKey][dateTimeOriginalKey],
      formData[pageKey].time
    );
    const dateTimeNewKey :string = getEntityAddressKey(infractionEventEKID, INFRACTION_EVENT, DATETIME_COMPLETED);
    const notesNewKey = getEntityAddressKey(infractionEventEKID, INFRACTION_EVENT, NOTES);
    const typeNewKey = getEntityAddressKey(infractionEventEKID, INFRACTION_EVENT, TYPE);

    dataToProcess[pageKey][dateTimeNewKey] = dateTimeCompleted;
    dataToProcess[pageKey][notesNewKey] = formData[pageKey][getEntityAddressKey(0, INFRACTION_EVENT, NOTES)];
    dataToProcess[pageKey][typeNewKey] = formData[pageKey][getEntityAddressKey(0, INFRACTION_EVENT, TYPE)];

    const {
      [DATETIME_COMPLETED]: infractionDateTime,
      [NOTES]: infractionNotes,
      [TYPE]: infractionType
    } = getEntityProperties(infractionEvent, [DATETIME_COMPLETED, NOTES, TYPE]);
    const originalData :Object = {
      [pageKey]: {
        [dateTimeNewKey]: DateTime.fromISO(infractionDateTime).toISO(), // discrepancy between luxon UTC format and ours
        [typeNewKey]: infractionType,
        [notesNewKey]: infractionNotes,
      }
    };

    const entityData :Object = processEntityDataForPartialReplace(
      dataToProcess,
      originalData,
      this.createEntitySetIdsMap(),
      this.createPropertyTypeIdsMap(),
      {}
    );

    actions.editInfractionEvent({ entityData });
  }

  render() {
    const { formData } = this.state;

    const formContext :{} = {
      entityIndexToIdMap: this.createEntityIndexToIdMap(),
      entitySetIds: this.createEntitySetIdsMap(),
      propertyTypeIds: this.createPropertyTypeIdsMap(),
    };
    return (
      <FormWrapper>
        <Form
            formData={formData}
            formContext={formContext}
            onChange={this.handleOnChange}
            onSubmit={this.handleOnSubmit}
            schema={schema}
            uiSchema={uiSchema} />
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
    editInfractionEvent,
  }, dispatch)
});


// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditInfractionForm);
