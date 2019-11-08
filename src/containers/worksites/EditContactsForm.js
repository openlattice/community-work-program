// @flow
import React, { Component } from 'react';
import { Map, fromJS, getIn } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addWorksiteContacts, editWorksiteContactAndAddress } from './WorksitesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { contactsSchema, contactsUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';

const {
  CONTACT_INFORMATION,
  CONTACT_INFO_GIVEN,
  EMPLOYEE,
  IS,
  STAFF,
  WORKS_AT,
  WORKSITE,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  FIRST_NAME,
  LAST_NAME,
  PHONE_NUMBER,
  TITLE,
} = PROPERTY_TYPE_FQNS;

const {
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
  processAssociationEntityData,
} = DataProcessingUtils;

type Props = {
  actions:{
    addWorksiteContacts :RequestSequence;
    editWorksiteContactAndAddress :RequestSequence;
  },
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  propertyTypeIds :Object;
  worksite :Map;
  worksiteContacts :List;
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
    const { worksiteContacts } = this.props;
    if (!prevProps.worksiteContacts.equals(worksiteContacts)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { worksiteContacts } = this.props;

    const prepopulated = !(worksiteContacts.isEmpty());
    const formData :Object = {};
    if (prepopulated) {

      const sectionOneKey = getPageSectionKey(1, 1);
      formData[sectionOneKey] = [];

      const contact :Object = {};
      let arrayIndex :number = -1;
      worksiteContacts.forEach((contactMap :Map) => {
        const contactPerson = contactMap.get(STAFF, Map());
        const {
          [FIRST_NAME]: firstName,
          [LAST_NAME]: lastName,
        } = getEntityProperties(contactPerson, [FIRST_NAME, LAST_NAME]);
        contact[getEntityAddressKey(arrayIndex, STAFF, FIRST_NAME)] = firstName;
        contact[getEntityAddressKey(arrayIndex, STAFF, LAST_NAME)] = lastName;

        const contactPhone = contactMap.get(PHONE_NUMBER);
        const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(contactPhone, [PHONE_NUMBER]);
        contact[getEntityAddressKey(arrayIndex, CONTACT_INFORMATION, PHONE_NUMBER)] = phoneNumber;

        const contactEmail = contactMap.get(EMAIL);
        const { [EMAIL]: email } = getEntityProperties(contactEmail, [EMAIL]);
        contact[getEntityAddressKey(arrayIndex - 1, CONTACT_INFORMATION, EMAIL)] = email;

        formData[sectionOneKey].push(contact);
        arrayIndex -= 1;
      });
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
    console.log('formData: ', formData);

    // const contactIndexMapper = (index :number) => index +

    const storedContactData :[] = getIn(formData, [getPageSectionKey(1, 1)]);
    console.log('storedContactData: ', storedContactData);
    const newContactsList :Object[] = storedContactData.map((contact :{}, index :number) => {
      const newContact :{} = {};
      newContact[getEntityAddressKey(0, EMPLOYEE, TITLE)] = 'worksite employee';
      newContact[getEntityAddressKey(index, STAFF, FIRST_NAME)] = contact[getEntityAddressKey(-1, STAFF, FIRST_NAME)]
        || '';
      newContact[getEntityAddressKey(index, STAFF, LAST_NAME)] = contact[getEntityAddressKey(-1, STAFF, LAST_NAME)]
        || '';
      newContact[getEntityAddressKey(index, CONTACT_INFORMATION, PHONE_NUMBER)] = contact[getEntityAddressKey(
        -1, CONTACT_INFORMATION, PHONE_NUMBER
      )] || '';
      newContact[getEntityAddressKey(index + 1, CONTACT_INFORMATION, EMAIL)] = contact[
        getEntityAddressKey(-2, CONTACT_INFORMATION, EMAIL)
      ] || '';
      return newContact;
    });
    console.log('newContactsList: ', newContactsList);
    const contacts = {
      [getPageSectionKey(1, 1)]: {}
    };
    contacts[getPageSectionKey(1, 1)] = newContactsList;

    const associations = [];
    const worksiteEKID :UUID = getEntityKeyId(worksite);
    fromJS(newContactsList).forEach((contact :Map, index :number) => {
      associations.push([IS, index, STAFF, index, EMPLOYEE, {}]);
      associations.push([WORKS_AT, index, EMPLOYEE, worksiteEKID, WORKSITE, {}]);
      associations.push([CONTACT_INFO_GIVEN, index, CONTACT_INFORMATION, index, EMPLOYEE, {}]);
      associations.push([CONTACT_INFO_GIVEN, index + 1, CONTACT_INFORMATION, index, EMPLOYEE, {}]);
    });

    const entityData :Object = processEntityData(contacts, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    console.log('entityData: ', entityData);
    console.log('associationEntityData: ', associationEntityData);
    actions.addWorksiteContacts({ associationEntityData, entityData });
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
      addActions: {
        addContact: this.handleOnSubmit
      },
      // editAction: actions.editWorksiteContactAndAddress,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <Card>
        <CardHeader mode="primary" padding="sm">Edit Work Site Contacts</CardHeader>
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

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addWorksiteContacts,
    editWorksiteContactAndAddress,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditContactsForm);
