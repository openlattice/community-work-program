// @flow
import { Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getImageDataFromEntity } from '../../../utils/BinaryUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { IMAGE } = APP_TYPE_FQNS;
const { IMAGE_DATA } = PROPERTY_TYPE_FQNS;

const getOriginalFormData = (personPhoto :Map) => {
  const imageUrl = getImageDataFromEntity(personPhoto);
  const photoFormData :Map = Map().withMutations((map :Map) => {
    if (imageUrl) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, IMAGE, IMAGE_DATA)], imageUrl);
  });
  return photoFormData;
};

/* eslint-disable import/prefer-default-export */
export {
  getOriginalFormData,
};
