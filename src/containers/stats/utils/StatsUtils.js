// @flow
import { Map } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';

const sortGraphData = (graphData :Object[]) => (
  graphData.sort((obj1 :Object, obj2 :Object) => {
    if (obj1.x < obj2.x) return -1;
    if (obj1.x > obj2.x) return 1;
    return 0;
  }));

const formatReferralsCourtTypeData = (referralsByCourtTypeGraphData :Map) :Object[] => {
  const graphData :Object[] = [];
  referralsByCourtTypeGraphData.forEach((numberOfReferrals :number, courtType :string) => {
    graphData.push({ x: numberOfReferrals, y: courtType });
  });
  return graphData;
};

const formatEnrollmentStatusPeopleData = (enrollmentsByCourtType :Map) :Object[] => {
  const graphData :Object[] = [];
  enrollmentsByCourtType.forEach((numberOfParticipants :number, courtType :string) => {
    if (isDefined(numberOfParticipants) && isDefined(courtType)) {
      graphData.push({ y: courtType, x: numberOfParticipants });
    }
  });
  return sortGraphData(graphData);
};

const formatMonthlyHoursAndParticipantsData = (
  monthlyHoursWorkedByCourtType :Map,
  monthlyTotalParticipantsByCourtType :Map
) :Object => {

  const hoursGraphData :Object[] = [];
  const participantsGraphData :Object[] = [];
  monthlyHoursWorkedByCourtType.forEach((hoursTotal :number, courtType :string) => {
    if (isDefined(hoursTotal) && isDefined(courtType)) {
      hoursGraphData.push({ y: courtType, x: hoursTotal });
    }
  });
  monthlyTotalParticipantsByCourtType.forEach((participantsTotal :number, courtType :string) => {
    if (isDefined(participantsTotal) && isDefined(courtType)) {
      participantsGraphData.push({ y: courtType, x: participantsTotal });
    }
  });
  return { hoursGraphData, participantsGraphData };
};

const formatHoursByWorksiteData = (hoursByWorksite :Map) :Object[] => {
  const graphData :Object[] = [];
  hoursByWorksite.forEach((hours :number, worksite :string) => {
    if (isDefined(hours) && isDefined(worksite)) {
      graphData.push({ y: worksite, x: hours });
    }
  });
  return sortGraphData(graphData);
};

const formatRadialChartData = (valuesMap :Map) => {
  const chartData :Object[] = [];
  const valuesNotFound :string[] = [];
  const sortedValuesMap = valuesMap.sort((val1 :number, val2 :number) => {
    if (val1 < val2) return -1;
    if (val1 > val2) return 1;
    return 0;
  });
  // const totalCount :number = valuesMap.reduce((sum :number, value :number) => sum + value);
  let lowestValue = 0;
  sortedValuesMap.forEach((valueCount :number, value :string) => {
    if (lowestValue) {
      const angle :number = valueCount / lowestValue;
      chartData.push({ angle, label: value });
    }
    if (!lowestValue) {
      if (valueCount === lowestValue) valuesNotFound.push(value);
      else {
        lowestValue = valueCount;
        chartData.push({ angle: 1, label: value });
      }
    }
  });
  return { chartData, valuesNotFound };
};

export {
  formatEnrollmentStatusPeopleData,
  formatHoursByWorksiteData,
  formatMonthlyHoursAndParticipantsData,
  formatRadialChartData,
  formatReferralsCourtTypeData,
};
