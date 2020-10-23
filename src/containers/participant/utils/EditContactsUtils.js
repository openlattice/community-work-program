// @flow
import { Map, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { CONTACT_INFORMATION } = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = PROPERTY_TYPE_FQNS;

const getOriginalPhoneFormData = (phone :Map) :Object => {
  let originalFormData = {
    [getPageSectionKey(1, 1)]: {}
  };
  if (phone.isEmpty()) return originalFormData;
  const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(phone, [PHONE_NUMBER]);
  originalFormData = setIn(
    originalFormData,
    [getPageSectionKey(1, 1), getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)],
    phoneNumber
  );
  return originalFormData;
};

const getOriginalEmailFormData = (email :Map) :Object => {
  let originalFormData = {
    [getPageSectionKey(1, 1)]: {}
  };
  if (email.isEmpty()) return originalFormData;
  const { [EMAIL]: emailAddress } = getEntityProperties(email, [EMAIL]);
  originalFormData = setIn(
    originalFormData,
    [getPageSectionKey(1, 1), getEntityAddressKey(0, CONTACT_INFORMATION, EMAIL)],
    emailAddress
  );
  return originalFormData;
};

export {
  getOriginalEmailFormData,
  getOriginalPhoneFormData,
};
