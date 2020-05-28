// @flow
import { List, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { getValuesFromEntityList } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getPageSectionKey } = DataProcessingUtils;

/* eslint-disable import/prefer-default-export */
export const hydrateSchema = (schema :Object, worksitesList :List) => {
  const [values, labels] = getValuesFromEntityList(worksitesList, [PROPERTY_TYPE_FQNS.NAME]);

  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'properties',
      'worksite',
      'enum'
    ],
    values
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'properties',
      'worksite',
      'enumNames'
    ],
    labels
  );

  return newSchema;
};
