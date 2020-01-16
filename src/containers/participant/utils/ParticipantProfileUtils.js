// @flow
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { DATETIME_RECEIVED, CHECK_IN_DATETIME, ORIENTATION_DATETIME } = PROPERTY_TYPE_FQNS;

const generateDiversionPlanOptions = (entities :List) :Object[] => {
  const options = [];
  entities.forEach((entity :Map) => {
    const {
      [DATETIME_RECEIVED]: sentenceDateTime,
      [CHECK_IN_DATETIME]: checkInDateTime,
      [ORIENTATION_DATETIME]: orientationDateTime,
    } = getEntityProperties(entity, [DATETIME_RECEIVED, CHECK_IN_DATETIME, ORIENTATION_DATETIME]);

    let date :string = '';
    const sentenceDateObj = DateTime.fromISO(sentenceDateTime);
    const checkInDateObj = DateTime.fromISO(checkInDateTime);
    const orientationDateObj = DateTime.fromISO(orientationDateTime);

    if (sentenceDateObj.isValid) date = sentenceDateObj.toLocaleString(DateTime.DATE_SHORT);
    else if (checkInDateObj.isValid) date = checkInDateObj.toLocaleString(DateTime.DATE_SHORT);
    else if (orientationDateObj.isValid) date = orientationDateObj.toLocaleString(DateTime.DATE_SHORT);
    else date = '– Date Unknown';

    options.push({ label: `Enrollment ${date}`, value: entity });
  });
  return options;
};

export default generateDiversionPlanOptions;
