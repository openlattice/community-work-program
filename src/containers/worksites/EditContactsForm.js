// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  PEOPLE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { contactsSchema, contactsUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getEntityProperties } from '../../utils/DataUtils';

const { FULL_ADDRESS } = ADDRESS_FQNS;
const { ADDRESS, CONTACT_INFORMATION, STAFF } = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

const {
  getEntityAddressKey,
  getPageSectionKey,
} = DataProcessingUtils;

type Props = {
  actions:{
    editPersonCase :RequestSequence;
  },
  contactEmail :Map;
  contactPerson :Map;
  contactPhone :Map;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  propertyTypeIds :Object;
  worksiteAddress :Map;
};

type State = {
  formData :Object;
  prepopulated :boolean;
};

class EditContactsForm extends Component<Props, State> {

  state = {
    formData: {},
    prepopulated: false,
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const {
      contactEmail,
      contactPerson,
      contactPhone,
      worksiteAddress,
    } = this.props;
    if (!prevProps.contactEmail.equals(contactEmail)
        || !prevProps.contactPerson.equals(contactPerson)
        || !prevProps.contactPhone.equals(contactPhone)
        || !prevProps.worksiteAddress.equals(worksiteAddress)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      contactEmail,
      contactPerson,
      contactPhone,
      worksiteAddress,
    } = this.props;

    const prepopulated = !contactEmail.isEmpty() && !contactPerson.isEmpty()
      && !contactPhone.isEmpty() && !worksiteAddress.isEmpty();
    const formData = {};
    if (prepopulated) {
      const {
        [FIRST_NAME]: firstName,
        [LAST_NAME]: lastName,
      } = getEntityProperties(contactPerson, [FIRST_NAME, LAST_NAME]);
      const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(contactPhone, [PHONE_NUMBER]);
      const { [EMAIL]: email } = getEntityProperties(contactEmail, [EMAIL]);
      const { [FULL_ADDRESS]: address } = getEntityProperties(worksiteAddress, [FULL_ADDRESS]);

      const sectionOneKey = getPageSectionKey(1, 1);
      const sectionTwoKey = getPageSectionKey(1, 2);
      const sectionThreeKey = getPageSectionKey(1, 3);

      formData[sectionOneKey] = {};
      formData[sectionOneKey][getEntityAddressKey(0, STAFF, FIRST_NAME)] = firstName;
      formData[sectionOneKey][getEntityAddressKey(0, STAFF, LAST_NAME)] = lastName;

      formData[sectionTwoKey] = {};
      formData[sectionTwoKey][getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)] = phoneNumber;
      formData[sectionTwoKey][getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)] = email;

      formData[sectionThreeKey] = {};
      formData[sectionThreeKey][getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)] = address;
    }

    this.setState({
      formData,
      prepopulated,
    });
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
      // editAction: actions.editPersonCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <Card>
        <CardHeader padding="sm">Edit Worksite Contacts</CardHeader>
        <Form
            disabled={prepopulated}
            formContext={formContext}
            formData={formData}
            schema={contactsSchema}
            uiSchema={contactsUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // editPersonCase,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditContactsForm);
