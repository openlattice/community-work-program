// @flow
import React, { Component } from 'react';
import { Map, hasIn } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addWorksiteContactAndAddress } from './WorksitesActions';
import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  EMPLOYEE_FQNS,
  PEOPLE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { contactsSchema, contactsUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';

const { FULL_ADDRESS } = ADDRESS_FQNS;
const {
  ADDRESS,
  CONTACT_INFORMATION,
  CONTACT_INFO_GIVEN,
  EMPLOYEE,
  IS,
  LOCATED_AT,
  STAFF,
  WORKS_AT,
  WORKSITE,
} = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const { TITLE } = EMPLOYEE_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

const {
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
  processAssociationEntityData,
} = DataProcessingUtils;

type Props = {
  actions:{
    addWorksiteContactAndAddress :RequestSequence;
  },
  contactEmail :Map;
  contactPerson :Map;
  contactPhone :Map;
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

    const prepopulated = !(contactEmail.isEmpty() && contactPerson.isEmpty()
      && contactPhone.isEmpty() && worksiteAddress.isEmpty());
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

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      entitySetIds,
      propertyTypeIds,
      worksite
    } = this.props;

    const worksiteEKID :UUID = getEntityKeyId(worksite);
    const dataToProcess = formData;
    dataToProcess[getPageSectionKey(1, 4)] = {};
    dataToProcess[getPageSectionKey(1, 4)][getEntityAddressKey(0, EMPLOYEE, TITLE)] = 'worksite employee';

    if (!Object.keys(formData[getPageSectionKey(1, 1)]).length) {
      dataToProcess[getPageSectionKey(1, 1)][getEntityAddressKey(0, STAFF, FIRST_NAME)] = '';
    }
    if (!hasIn(formData, [getPageSectionKey(1, 2), getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)])) {
      dataToProcess[getPageSectionKey(1, 2)][getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)] = '';
    }
    if (!hasIn(formData, [getPageSectionKey(1, 2), getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)])) {
      dataToProcess[getPageSectionKey(1, 2)][getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)] = '';
    }
    if (!hasIn(formData, [getPageSectionKey(1, 2), getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)])) {
      dataToProcess[getPageSectionKey(1, 2)][getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)] = '';
    }
    if (!Object.keys(formData[getPageSectionKey(1, 3)]).length) {
      dataToProcess[getPageSectionKey(1, 3)][getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)] = '';
    }

    const associations = [];
    associations.push([LOCATED_AT, worksiteEKID, WORKSITE, 0, ADDRESS, {}]);
    associations.push([IS, 0, STAFF, 0, EMPLOYEE, {}]);
    associations.push([WORKS_AT, 0, EMPLOYEE, worksiteEKID, WORKSITE, {}]);
    associations.push([CONTACT_INFO_GIVEN, 0, CONTACT_INFORMATION, 0, EMPLOYEE, {}]);
    associations.push([CONTACT_INFO_GIVEN, 1, CONTACT_INFORMATION, 0, EMPLOYEE, {}]);

    const entityData :Object = processEntityData(dataToProcess, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);

    actions.addWorksiteContactAndAddress({ associationEntityData, entityData });
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
            onSubmit={this.handleOnSubmit}
            schema={contactsSchema}
            uiSchema={contactsUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addWorksiteContactAndAddress,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditContactsForm);
