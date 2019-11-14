// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addWorksiteAddress, editWorksiteAddress } from './WorksitesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { addressSchema, addressUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';

const {
  ADDRESS,
  LOCATED_AT,
  WORKSITE,
} = APP_TYPE_FQNS;
const {
  FULL_ADDRESS,
} = PROPERTY_TYPE_FQNS;

const {
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
  processAssociationEntityData,
} = DataProcessingUtils;

type Props = {
  actions:{
    addWorksiteAddress :RequestSequence;
    editWorksiteAddress :RequestSequence;
  },
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  propertyTypeIds :Object;
  worksite :Map;
  worksiteAddress :Map;
};

type State = {
  formData :Object;
  prepopulated :boolean;
};

class EditWorksiteAddressForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
      prepopulated: false,
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { worksiteAddress } = this.props;
    if (!prevProps.worksiteAddress.equals(worksiteAddress)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      worksiteAddress,
    } = this.props;

    const prepopulated = !worksiteAddress.isEmpty();
    const formData = {};
    if (prepopulated) {
      const { [FULL_ADDRESS]: address } = getEntityProperties(worksiteAddress, [FULL_ADDRESS]);
      const sectionOneKey = getPageSectionKey(1, 1);
      formData[sectionOneKey] = {};
      formData[sectionOneKey][getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)] = address;
    }

    this.setState({
      formData,
      prepopulated,
    });
  }

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      entitySetIds,
      propertyTypeIds,
      worksite
    } = this.props;

    const worksiteEKID :UUID = getEntityKeyId(worksite);
    const associations = [
      [LOCATED_AT, worksiteEKID, WORKSITE, 0, ADDRESS, {}]
    ];
    const entityData :Object = processEntityData(formData, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    actions.addWorksiteAddress({ associationEntityData, entityData });
  }

  render() {
    const {
      actions,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    } = this.props;
    const {
      formData,
      prepopulated,
    } = this.state;

    const formContext = {
      editAction: actions.editWorksiteAddress,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <Card>
        <CardHeader mode="primary" padding="sm">Edit Work Site Address</CardHeader>
        <Form
            disabled={prepopulated}
            formContext={formContext}
            formData={formData}
            onSubmit={this.handleOnSubmit}
            schema={addressSchema}
            uiSchema={addressUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addWorksiteAddress,
    editWorksiteAddress,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditWorksiteAddressForm);
