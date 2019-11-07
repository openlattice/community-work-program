// @flow
import { isImmutable, Map } from 'immutable';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import toString from 'lodash/toString';

import {
  isEmptyString,
  isNonEmptyString,
  isNonEmptyStringArray
} from './LangUtils';
import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';

export function formatStringValueOrValues(rawValue :string | string[]) :string {

  if (!rawValue || (!rawValue.length)) return '';
  if (isString(rawValue)) {
    return rawValue || '';
  }
  return rawValue.join(', ');
}

export function formatImmutableValue(immutableMap :Map, property :any, backUpValue :any) :string {

  let value = backUpValue;
  if (!isImmutable(immutableMap)) {

    if (isString(backUpValue)) {
      return formatStringValueOrValues(backUpValue);
    }
    if (isNumber(backUpValue)) {
      return toString(backUpValue);
    }
    return '';
  }

  value = immutableMap.get(property, backUpValue);
  if (isEmptyString(value) || isNonEmptyString(value) || isNonEmptyStringArray(value)) {
    return formatStringValueOrValues(value);
  }

  if (isNumber(value)) {
    return toString(value);
  }

  return '';
}

export function formatPairOfStrings(values :string[]) :string {

  if (!values.length || values.every((v) => v === values[0])) return EMPTY_FIELD;
  if (values.length === 1) return values[0];
  return `${values[0]}/${values[1]}`;
}
