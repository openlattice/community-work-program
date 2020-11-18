/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import { editInfractionEvent } from './InfractionsActions';
import { schema, uiSchema } from './schemas/EditInfractionSchemas';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { APP, EDM, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityDataForPartialReplace,
} = DataProcessingUtils;

const { INFRACTION_EVENT } = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, NOTES, TYPE } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

const FormWrapper = styled.div`
  width: 600px;
`;

type Props = {
  actions:{
    editInfractionEvent :RequestSequence;
  },
  entitySetIds :Map;
  infractionCategory :string;
  infractionEvent :Map;
  propertyTypeIds :Map;
};

type State = {
  formData :Object;
};

class EditInfractionForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
    };
  }

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

  handleOnChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      entitySetIds,
      infractionEvent,
      propertyTypeIds,
    } = this.props;

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
      entitySetIds,
      propertyTypeIds,
      {}
    );

    actions.editInfractionEvent({ entityData });
  }

  render() {
    const { entitySetIds, propertyTypeIds } = this.props;
    const { formData } = this.state;

    const formContext :{} = {
      entityIndexToIdMap: this.createEntityIndexToIdMap(),
      entitySetIds,
      propertyTypeIds,
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
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editInfractionEvent,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditInfractionForm);
