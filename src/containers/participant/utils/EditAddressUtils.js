// @flow
import { Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { ADDRESS } = APP_TYPE_FQNS;
const {
  CITY,
  FULL_ADDRESS,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const getOriginalFormData = (address :Map) :Object => {
  const originalFormData = {
    [getPageSectionKey(1, 1)]: {}
  };
  const {
    [CITY]: city,
    [FULL_ADDRESS]: streetAddress,
    [US_STATE]: state,
    [ZIP]: zipCode,
  } = getEntityProperties(address, [CITY, FULL_ADDRESS, US_STATE, ZIP]);

  if (!address.isEmpty()) {
    originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)] = streetAddress;
    originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, ADDRESS, CITY)] = city || '';
    originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, ADDRESS, US_STATE)] = state || '';
    originalFormData[getPageSectionKey(1, 1)][getEntityAddressKey(0, ADDRESS, ZIP)] = zipCode || '';
  }

  return originalFormData;
};

/* eslint-disable import/prefer-default-export */
export {
  getOriginalFormData,
};
