// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editWorksite } from './WorksitesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { worksiteSchema, worksiteUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getEntityProperties } from '../../utils/DataUtils';

const { WORKSITE } = APP_TYPE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = PROPERTY_TYPE_FQNS;

const {
  getEntityAddressKey,
  getPageSectionKey,
} = DataProcessingUtils;

type Props = {
  actions:{
    editWorksite :RequestSequence;
  },
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  propertyTypeIds :Object;
  worksite :Map;
};

type State = {
  formData :Object;
};

class EditWorksiteForm extends Component<Props, State> {

  state = {
    formData: {},
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { worksite } = this.props;
    if (!prevProps.worksite.equals(worksite)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { worksite } = this.props;

    const formData = {};
    const {
      [DATETIME_END]: dateInactive,
      [DATETIME_START]: dateActive,
      [DESCRIPTION]: availableWork,
      [NAME]: worksiteName
    } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START, DESCRIPTION, NAME]);

    const sectionOneKey = getPageSectionKey(1, 1);
    formData[sectionOneKey] = {};
    formData[sectionOneKey][getEntityAddressKey(0, WORKSITE, NAME)] = worksiteName;
    formData[sectionOneKey][getEntityAddressKey(0, WORKSITE, DATETIME_START)] = DateTime
      .fromISO(dateActive).toISODate() || '';
    formData[sectionOneKey][getEntityAddressKey(0, WORKSITE, DATETIME_END)] = DateTime
      .fromISO(dateInactive).toISODate() || '';
    formData[sectionOneKey][getEntityAddressKey(0, WORKSITE, DESCRIPTION)] = availableWork;

    this.setState({
      formData,
    });
  }

  render() {
    const {
      actions,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    } = this.props;
    const { formData } = this.state;

    const formContext = {
      editAction: actions.editWorksite,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <Card>
        <CardHeader mode="primary" padding="sm">Edit Work Site Info</CardHeader>
        <Form
            disabled
            formContext={formContext}
            formData={formData}
            schema={worksiteSchema}
            uiSchema={worksiteUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditWorksiteForm);
