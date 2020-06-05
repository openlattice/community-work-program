// @flow
import { List, Map, fromJS } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';
import { RADIAL_CHART_COLORS } from '../consts/ColorConsts';
import { DOWNLOAD_CONSTS } from '../consts/StatsConsts';
import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';

const {
  COUNT,
  COURT_TYPE,
  PARTICIPANTS,
  STATUSES,
  TOTAL,
  TOTAL_FOR_ALL_COURT_TYPES,
  WORKSITE,
} = DOWNLOAD_CONSTS;

const sortGraphData = (graphData :Object[]) => (
  graphData.sort((obj1 :Object, obj2 :Object) => {
    if (obj1.x < obj2.x) return -1;
    if (obj1.x > obj2.x) return 1;
    return 0;
  }));

// Court Type:

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

const formatEnrollmentsDataForDownload = (
  activeEnrollmentsByCourtType :Map,
  closedEnrollmentsByCourtType :Map,
  jobSearchEnrollmentsByCourtType :Map,
  successfulEnrollmentsByCourtType :Map,
  unsuccessfulEnrollmentsByCourtType :Map,
) :List => {

  let mergedEnrollmentsByCourtType = activeEnrollmentsByCourtType
    .mergeWith((oldCount :number, newCount :number) => fromJS({
      [ENROLLMENT_STATUSES.ACTIVE]: oldCount,
      [ENROLLMENT_STATUSES.CLOSED]: newCount,
    }), closedEnrollmentsByCourtType);
  mergedEnrollmentsByCourtType = mergedEnrollmentsByCourtType
    .mergeWith((statusMap :Map, newCount :number) => statusMap.merge(fromJS({
      [ENROLLMENT_STATUSES.JOB_SEARCH]: newCount,
    })), jobSearchEnrollmentsByCourtType);
  mergedEnrollmentsByCourtType = mergedEnrollmentsByCourtType
    .mergeWith((statusMap :Map, newCount :number) => statusMap.merge(fromJS({
      [ENROLLMENT_STATUSES.SUCCESSFUL]: newCount,
    })), successfulEnrollmentsByCourtType);
  mergedEnrollmentsByCourtType = mergedEnrollmentsByCourtType
    .mergeWith((statusMap :Map, newCount :number) => statusMap.merge(fromJS({
      [ENROLLMENT_STATUSES.UNSUCCESSFUL]: newCount,
    })), unsuccessfulEnrollmentsByCourtType);

  mergedEnrollmentsByCourtType = mergedEnrollmentsByCourtType.delete(undefined);

  const formattedData :List = List().withMutations((list :List) => {
    mergedEnrollmentsByCourtType.forEach((statusMap :Map, courtType :string) => {
      const totalForCourtType :number = statusMap.reduce((sum :number, count :number) => sum + count);
      list.push(fromJS({
        [COURT_TYPE]: courtType,
        [STATUSES]: statusMap.keySeq().toList()
          .map((status :string) => Map({ status, [COUNT]: statusMap.get(status) })),
        [TOTAL]: totalForCourtType,
      }));
    });
  });
  return formattedData;
};

const getBottomRowForEnrollments = (csvData :Object[]) => {
  const activeTotal :number = csvData.map((row :Object) => row[ENROLLMENT_STATUSES.ACTIVE])
    .reduce((sum :number, count :number) => sum + count);
  const closedTotal :number = csvData.map((row :Object) => row[ENROLLMENT_STATUSES.CLOSED])
    .reduce((sum :number, count :number) => sum + count);
  const jobSearchTotal :number = csvData.map((row :Object) => row[ENROLLMENT_STATUSES.JOB_SEARCH])
    .reduce((sum :number, count :number) => sum + count);
  const successfulTotal :number = csvData.map((row :Object) => row[ENROLLMENT_STATUSES.SUCCESSFUL])
    .reduce((sum :number, count :number) => sum + count);
  const unsuccessfulTotal :number = csvData.map((row :Object) => row[ENROLLMENT_STATUSES.UNSUCCESSFUL])
    .reduce((sum :number, count :number) => sum + count);
  const countTotal :number = activeTotal + closedTotal + jobSearchTotal + successfulTotal + unsuccessfulTotal;
  return {
    'Court Type': TOTAL_FOR_ALL_COURT_TYPES,
    [ENROLLMENT_STATUSES.ACTIVE]: activeTotal,
    [ENROLLMENT_STATUSES.CLOSED]: closedTotal,
    [ENROLLMENT_STATUSES.JOB_SEARCH]: jobSearchTotal,
    [ENROLLMENT_STATUSES.SUCCESSFUL]: successfulTotal,
    [ENROLLMENT_STATUSES.UNSUCCESSFUL]: unsuccessfulTotal,
    Total: countTotal,
  };
};

const formatParticipantsAndHoursDataForDownload = (
  monthlyHoursWorkedByCourtType :Map,
  monthlyTotalParticipantsByCourtType :Map,
) :List => {

  const formattedData :List = List().withMutations((list :List) => {
    monthlyTotalParticipantsByCourtType.forEach((participantsCount :number, courtType :string) => {
      const hoursCount :number = monthlyHoursWorkedByCourtType.get(courtType);
      list.push(fromJS({
        [COURT_TYPE]: courtType,
        Participants: participantsCount,
        Hours: hoursCount,
      }));
    });
  });
  return formattedData;
};

const getBottomRowForParticipantsAndHours = (csvData :Object[]) => {
  const participantsTotal :number = csvData.map((row :Object) => row.Participants)
    .reduce((sum :number, count :number) => sum + count);
  const hoursTotal :number = csvData.map((row :Object) => row.Hours)
    .reduce((sum :number, count :number) => sum + count);
  return {
    'Court Type': TOTAL_FOR_ALL_COURT_TYPES,
    Participants: participantsTotal,
    Hours: hoursTotal,
  };
};

const formatParticipantsByCourtTypeDataForDownload = (monthlyParticipantsByCourtType :Map) :List => {

  const formattedData :List = List().withMutations((list :List) => {
    monthlyParticipantsByCourtType.forEach((participantsList :Map, courtType :string) => {
      if (participantsList.isEmpty()) {
        list.push(fromJS({
          [COURT_TYPE]: courtType,
          Participant: '',
          Hours: 0,
        }));
      }
      participantsList.forEach((participantMap :Map) => {
        const personName :string = participantMap.get('personName', '');
        const hours :number = participantMap.get('hours', 0);
        if (isDefined(courtType)) {
          list.push(fromJS({
            [COURT_TYPE]: courtType,
            Participant: personName,
            Hours: hours,
          }));
        }
      });
    });
  });
  return formattedData;
};

// Worksite:

const formatHoursByWorksiteData = (hoursByWorksite :Map) :Object[] => {
  const graphData :Object[] = [];
  hoursByWorksite.forEach((hours :number, worksite :string) => {
    if (isDefined(hours) && isDefined(worksite)) {
      graphData.push({ y: worksite, x: hours });
    }
  });
  return sortGraphData(graphData);
};

const formatWorksiteHoursDataForDownload = (hoursByWorksite :Map) :List => {
  const formattedData :List = List().withMutations((list :List) => {
    hoursByWorksite.forEach((hoursCount :Map, worksite :string) => {
      list.push(fromJS({
        [WORKSITE]: worksite,
        [TOTAL]: hoursCount,
      }));
    });
  });
  return formattedData;
};

const formatWorksiteParticipantsDataForDownload = (participantsByWorksite :Map) :List => {
  const formattedData :List = List().withMutations((list :List) => {
    participantsByWorksite.forEach((participantsNames :Map, worksite :string) => {
      list.push(fromJS({
        [WORKSITE]: worksite,
        [PARTICIPANTS]: participantsNames.join(','),
      }));
    });
  });
  return formattedData;
};

// Demographics:

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
  formatEnrollmentsDataForDownload,
  formatHoursByWorksiteData,
  formatMonthlyHoursAndParticipantsData,
  formatParticipantsAndHoursDataForDownload,
  formatParticipantsByCourtTypeDataForDownload,
  formatRadialChartData,
  formatWorksiteHoursDataForDownload,
  formatWorksiteParticipantsDataForDownload,
  getBottomRowForEnrollments,
  getBottomRowForParticipantsAndHours,
  getListForRadialChartKey,
};
