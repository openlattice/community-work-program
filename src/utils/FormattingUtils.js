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

const formatStringValueOrValues = (rawValue :string | string[]) :string => {

  if (!rawValue || (!rawValue.length)) return '';
  if (isString(rawValue)) {
    return rawValue || '';
  }
  return rawValue.join(', ');
};

const formatImmutableValue = (immutableMap :Map, property :any, backUpValue :any) :string => {

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
};

const formatPairOfStrings = (values :string[]) :string => {

  if (!values.length || values.every((v) => v === values[0])) return EMPTY_FIELD;
  if (values.length === 1) return values[0];
  return `${values[0]}/${values[1]}`;
};

const generateTableHeaders = (headers :string[]) :Object[] => {

  const tableHeaders = [];
  headers.forEach((header :string) => {
    tableHeaders.push({
      cellStyle: {
        backgroundColor: 'white',
        color: 'black',
        fontSize: '10px',
        fontWeight: '600',
        padding: '15px 0',
        textAlign: 'left',
      },
      key: header,
      label: header,
      sortable: (header && header !== ' ') || false,
    });
  });
  return tableHeaders;
};

export {
  formatImmutableValue,
  formatPairOfStrings,
  formatStringValueOrValues,
  generateTableHeaders,
};
