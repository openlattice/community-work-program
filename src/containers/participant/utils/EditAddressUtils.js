// @flow
import set from 'lodash/set';
import { Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { EDIT_FORMS_PSK } from '../schemas/SchemaConstants';

const { getEntityAddressKey } = DataProcessingUtils;
const { ADDRESS } = APP_TYPE_FQNS;
const {
  CITY,
  FULL_ADDRESS,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const getOriginalFormData = (address :Map) :Object => {
  const originalFormData = {
    [EDIT_FORMS_PSK]: {}
  };
  const addressValues = getEntityProperties(address, [CITY, FULL_ADDRESS, US_STATE, ZIP]);
  if (!address.isEmpty()) {
    Object.entries(addressValues).forEach(([fqn, value]) => {
      set(originalFormData, [EDIT_FORMS_PSK, getEntityAddressKey(0, ADDRESS, fqn)], value || '');
    });
  }
  return originalFormData;
};

/* eslint-disable import/prefer-default-export */
export {
  getOriginalFormData,
};
