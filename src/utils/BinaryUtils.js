// @flow
import { Map } from 'immutable';

import { isNonEmptyStringArray } from './LangUtils';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { IMAGE_DATA } = PROPERTY_TYPE_FQNS;

const DATA_URL_PREFIX_REGEX = new RegExp(/^data:image\/.*base64,/);

const removeDataUriPrefix = (value :string) => {
  const match = value.match(DATA_URL_PREFIX_REGEX);

  if (Array.isArray(match) && isNonEmptyStringArray(match)) {
    const dataUri = match[0];
    return value.slice(dataUri.length);
  }

  return value;
};

const isValidBase64 = (value :string) :boolean => {
  if (typeof value !== 'string') return false;
  try {
    return btoa(atob(value)) === value;
  }
  catch (error) {
    return false;
  }
};

const formatFileSource = (imageData :string, mimeType :string) :?string => {
  // if not valid base 64, trust
  if (isValidBase64(imageData)) {
    return `data:${mimeType};base64,${imageData}`;
  }

  if (typeof imageData === 'string') {
    return imageData;
  }

  return undefined;
};

const getImageDataFromEntity = (imageEntity :Map) => {
  const imageDataValue = imageEntity.getIn([IMAGE_DATA, 0]);
  return formatFileSource(imageDataValue, 'image/jpg');
};


export {
  DATA_URL_PREFIX_REGEX,
  formatFileSource,
  getImageDataFromEntity,
  isValidBase64,
  removeDataUriPrefix,
};
