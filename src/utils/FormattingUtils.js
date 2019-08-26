// @flow
import { isImmutable, Map } from 'immutable';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import {
  isDefined,
  isEmptyString,
  isNonEmptyString,
  isNonEmptyStringArray
} from './LangUtils';

export function formatStringValueOrValues(rawValue :string | string[]) :string {

  if (!rawValue || (!rawValue.length)) return '';
  if (isString(rawValue)) {
    return rawValue || '';
  }
  return rawValue.join(', ');
}

export function formatNumericalValue(rawValue :number) :string {

  if (!isDefined(rawValue)) return '';
  return (rawValue).toString();
}

export function formatImmutableValue(immutableMap :Map, property :any, backUpValue :any) :string {

  let value = backUpValue;
  if (!isImmutable(immutableMap)) {

    if (isString(backUpValue)) {
      return formatStringValueOrValues(backUpValue);
    }
    if (isNumber(backUpValue)) {
      return formatNumericalValue(backUpValue);
    }
    return '';
  }

  value = immutableMap.get(property, backUpValue);
  if (isEmptyString(value) || isNonEmptyString(value) || isNonEmptyStringArray(value)) {
    return formatStringValueOrValues(value);
  }

  if (isNumber(value)) {
    return formatNumericalValue(value);
  }

  return '';
}
