// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';

const { DATETIME_RECEIVED, CHECK_IN_DATETIME, ORIENTATION_DATETIME } = PROPERTY_TYPE_FQNS;

const generateDiversionPlanOptions = (entities :List) :Object[] => {
  const options = [];
  entities.forEach((entity :Map) => {
    const {
      [DATETIME_RECEIVED]: sentenceDateTime,
      [CHECK_IN_DATETIME]: checkInDateTime,
      [ORIENTATION_DATETIME]: orientationDateTime,
    } = getEntityProperties(entity, [DATETIME_RECEIVED, CHECK_IN_DATETIME, ORIENTATION_DATETIME]);

    let label :string = 'Enrollment ';
    const sentenceDateObj = DateTime.fromISO(sentenceDateTime);
    const checkInDateObj = DateTime.fromISO(checkInDateTime);
    const orientationDateObj = DateTime.fromISO(orientationDateTime);

    if (sentenceDateObj.isValid) label += sentenceDateObj.toLocaleString(DateTime.DATE_SHORT);
    else if (checkInDateObj.isValid) label += checkInDateObj.toLocaleString(DateTime.DATE_SHORT);
    else if (orientationDateObj.isValid) label += orientationDateObj.toLocaleString(DateTime.DATE_SHORT);
    else label = EMPTY_FIELD;

    options.push({ label, value: entity });
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
