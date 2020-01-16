// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editRequiredHours } from '../ParticipantActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  requiredHoursSchema,
  requiredHoursUiSchema,
} from '../schemas/EditCaseInfoSchemas';
import {
  getEntityProperties,
} from '../../../utils/DataUtils';

const {
  getEntityAddressKey,
  getPageSectionKey,
} = DataProcessingUtils;

const { DIVERSION_PLAN } = APP_TYPE_FQNS;
const { REQUIRED_HOURS } = PROPERTY_TYPE_FQNS;

type Props = {
  actions:{
    editRequiredHours :RequestSequence;
  },
  diversionPlan :Map;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  propertyTypeIds :Object;
};

type State = {
  requiredHoursFormData :Object;
};

class EditRequiredHoursForm extends Component<Props, State> {

  state = {
    requiredHoursFormData: {},
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { diversionPlan } = this.props;
    if (!prevProps.diversionPlan.equals(diversionPlan)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { diversionPlan } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);
    const { [REQUIRED_HOURS]: requiredHours } = getEntityProperties(diversionPlan, [REQUIRED_HOURS]);
    const requiredHoursFormData :{} = {
      [sectionOneKey]: {
        [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: requiredHours
      }
    };

    this.setState({ requiredHoursFormData });
  }

  render() {
    const {
      actions,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    } = this.props;
    const {
      requiredHoursFormData,
    } = this.state;

    const requiredHoursFormContext = {
      editAction: actions.editRequiredHours,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };


    return (
      <Card>
        <CardHeader padding="sm">Edit Required Hours</CardHeader>
        <Form
            disabled
            formContext={requiredHoursFormContext}
            formData={requiredHoursFormData}
            schema={requiredHoursSchema}
            uiSchema={requiredHoursUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editRequiredHours,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditRequiredHoursForm);
