// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ADDRESS,
  CONTACT_INFORMATION,
  IMAGE,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  CITY,
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  FULL_ADDRESS,
  IMAGE_DATA,
  LAST_NAME,
  PHONE_NUMBER,
  RACE,
  SEX,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

export const EDIT_FORMS_PSK :string = getPageSectionKey(1, 1);

/*
 * Person
 */

export const PERSON_FIRST_NAME_EAK :string = getEntityAddressKey(0, PEOPLE, FIRST_NAME);
export const PERSON_LAST_NAME_EAK :string = getEntityAddressKey(0, PEOPLE, LAST_NAME);
export const PERSON_DOB_EAK :string = getEntityAddressKey(0, PEOPLE, DOB);
export const PERSON_RACE_EAK :string = getEntityAddressKey(0, PEOPLE, RACE);
export const PERSON_ETHNICITY_EAK :string = getEntityAddressKey(0, PEOPLE, ETHNICITY);
export const PERSON_SEX_EAK :string = getEntityAddressKey(0, PEOPLE, SEX);

/*
 * Contacts
 */

export const PHONE_EAK :string = getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER);
export const EMAIL_EAK :string = getEntityAddressKey(0, CONTACT_INFORMATION, EMAIL);

/*
 * Address
 */

export const FULL_ADDRESS_EAK :string = getEntityAddressKey(0, ADDRESS, FULL_ADDRESS);
export const CITY_EAK :string = getEntityAddressKey(0, ADDRESS, CITY);
export const US_STATE_EAK :string = getEntityAddressKey(0, ADDRESS, US_STATE);
export const ZIP_EAK :string = getEntityAddressKey(0, ADDRESS, ZIP);

/*
 * Photo
 */

export const IMAGE_DATA_EAK :string = getEntityAddressKey(0, IMAGE, IMAGE_DATA);
