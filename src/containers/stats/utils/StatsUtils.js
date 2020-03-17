// @flow
import { Map } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';

const formatEnrollmentsCourtTypeData = (enrollmentsByCourtTypeGraphData :Map) :Object[] => {
  const graphData :Object[] = [];
  enrollmentsByCourtTypeGraphData.forEach((numberOfEnrollments :number, courtType :string) => {
    graphData.push({ y: numberOfEnrollments, x: courtType });
  });
  return graphData;
};

const formatPeopleCourtTypeData = (peopleByCourtTypeGraphData :Map) :Object[] => {
  const graphData :Object[] = [];
  peopleByCourtTypeGraphData.forEach((numberOfActiveParticipants :number, courtType :string) => {
    if (isDefined(numberOfActiveParticipants) && isDefined(courtType)) {
      graphData.push({ y: numberOfActiveParticipants, x: courtType });
    }
  });
  return graphData;
};

export {
  formatEnrollmentsCourtTypeData,
  formatPeopleCourtTypeData,
};
