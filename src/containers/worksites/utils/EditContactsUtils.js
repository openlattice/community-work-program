/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { UUID } from 'lattice';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

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

const getOriginalFormData = (worksiteContacts :List, prepopulated :boolean) => {

  const formData :Object = {};

  if (prepopulated) {
    const sectionOneKey = getPageSectionKey(1, 1);
    formData[sectionOneKey] = [];

    worksiteContacts.forEach((contactMap :Map) => {
      const contact :Object = {};
      const contactPerson = contactMap.get(STAFF, Map());
      const {
        [FIRST_NAME]: firstName,
        [LAST_NAME]: lastName,
      } = getEntityProperties(contactPerson, [FIRST_NAME, LAST_NAME]);
      contact[getEntityAddressKey(-1, STAFF, FIRST_NAME)] = firstName;
      contact[getEntityAddressKey(-1, STAFF, LAST_NAME)] = lastName;

      const contactPhone = contactMap.get(PHONE_NUMBER);
      const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(contactPhone, [PHONE_NUMBER]);
      contact[getEntityAddressKey(-1, CONTACT_INFORMATION, PHONE_NUMBER)] = phoneNumber;

      const contactEmail = contactMap.get(EMAIL);
      const { [EMAIL]: email } = getEntityProperties(contactEmail, [EMAIL]);
      contact[getEntityAddressKey(-2, CONTACT_INFORMATION, EMAIL)] = email;

      formData[sectionOneKey].push(contact);
    });
  }
  return formData;
};

const updateSubmittedFormData = (formData :Object) => {

  const storedContactData :[] = getIn(formData, [getPageSectionKey(1, 1)]);
  const newContactsList :Object[] = storedContactData.map((contact :Object, index :number) => {
    const newContact = {};
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

  return {
    [getPageSectionKey(1, 1)]: newContactsList
  };
};

const getAssociations = (newContactsArray :Object[], worksiteEKID :UUID) => {
  const associations :Array<Array<*>> = [];
  newContactsArray.forEach((contact :Object, index :number) => {
    associations.push([IS, index, STAFF, index, EMPLOYEE, {}]);
    associations.push([WORKS_AT, index, EMPLOYEE, worksiteEKID, WORKSITE, {}]);
    associations.push([CONTACT_INFO_GIVEN, index, CONTACT_INFORMATION, index, EMPLOYEE, {}]);
    associations.push([CONTACT_INFO_GIVEN, index + 1, CONTACT_INFORMATION, index, EMPLOYEE, {}]);
  });
  return associations;
};

export {
  getAssociations,
  getOriginalFormData,
  updateSubmittedFormData,
};
