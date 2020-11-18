/*
 * @flow
 */

import { Map, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { UUID } from 'lattice';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';

const { getPageSectionKey } = DataProcessingUtils;
const { NAME } = PROPERTY_TYPE_FQNS;

/* eslint-disable import/prefer-default-export */
export const hydrateSchema = (schema :Object, worksitesByWorksitePlan :Map) => {
  const values = [];
  const labels = [];
  worksitesByWorksitePlan.forEach((worksite :Map, worksitePlanEKID :UUID) => {
    const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
    values.push(worksitePlanEKID);
    labels.push(worksiteName);
  });

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
