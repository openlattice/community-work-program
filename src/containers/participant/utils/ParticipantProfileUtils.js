// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { DATETIME_RECEIVED } = PROPERTY_TYPE_FQNS;

const generateDiversionPlanOptions = (entities :List) :Object[] => {
  const options = [];
  entities.forEach((entity :Map) => {
    const { [DATETIME_RECEIVED]: sentenceDateTime } = getEntityProperties(entity, [DATETIME_RECEIVED]);
    const sentenceDate = DateTime.fromISO(sentenceDateTime).toLocaleString(DateTime.DATE_SHORT);
    options.push({ label: `Enrollment ${sentenceDate}`, value: entity });
  });
  return options;
};


const enrollmentHeaderNames = ['STATUS', 'SENTENCE', 'ORIENTATION', 'COMPLETION', 'HOURS'];
const generateEnrollmentHeaders = () :Object[] => {

  const headers = [];
  enrollmentHeaderNames.forEach((header :string) => {
    headers.push({
      cellStyle: {
        backgroundColor: 'white',
        color: 'black',
        fontSize: '11px',
        fontWeight: '600',
        padding: '15px 10px',
        textAlign: 'left',
      },
      key: header,
      label: header,
      sortable: true,
    });
  });
  return headers;
};

export {
  enrollmentHeaderNames,
  generateDiversionPlanOptions,
  generateEnrollmentHeaders,
};