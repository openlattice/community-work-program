// @flow
import { List, Map, fromJS } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';
import { RADIAL_CHART_COLORS } from '../consts/ColorConsts';

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
  const totalCount :number = valuesMap.reduce((sum :number, value :number) => sum + value);
  let lowestValue = 0;
  sortedValuesMap.forEach((valueCount :number, value :string) => {
    if (lowestValue) {
      const angle :number = valueCount / lowestValue;
      chartData.push({
        angle,
        count: valueCount,
        label: `${Math.ceil((valueCount / totalCount) * 100)}%`,
        name: value
      });
    }
    if (!lowestValue) {
      if (valueCount === lowestValue) valuesNotFound.push(value);
      else {
        lowestValue = valueCount;
        chartData.push({
          angle: 1,
          count: valueCount,
          label: `${Math.ceil((valueCount / totalCount) * 100)}%`,
          name: value
        });
      }
    }
  });

  chartData.map((obj :Object, index :number) => {
    const newObj = obj;
    newObj.color = RADIAL_CHART_COLORS[chartData.length - 1 - index];
    return newObj;
  });
  return { chartData, valuesNotFound };
};

const getListForRadialChartKey = (chartData :Object[], valuesNotFound :string[]) :List => {
  const sortedChartData :List = fromJS(chartData).sortBy((obj :Map) => obj.get('angle'));

  let sortedListOfValues :List = sortedChartData.reverse().map((obj :Map, index :number) => {
    const name :string = obj.get('name');
    const color :string = RADIAL_CHART_COLORS[index];
    return { color, name };
  });

  const valuesFoundCount :number = sortedListOfValues.count();
  valuesNotFound.forEach((name :string, index :number) => {
    sortedListOfValues = sortedListOfValues.push({ color: RADIAL_CHART_COLORS[valuesFoundCount + index], name });
  });
  return sortedListOfValues;
};

export {
  formatEnrollmentStatusPeopleData,
  formatHoursByWorksiteData,
  formatMonthlyHoursAndParticipantsData,
  formatRadialChartData,
  formatReferralsCourtTypeData,
  getListForRadialChartKey,
};
