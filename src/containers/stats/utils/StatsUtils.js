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

export {
  formatEnrollmentStatusPeopleData,
  formatHoursByWorksiteData,
  formatMonthlyHoursAndParticipantsData,
  formatReferralsCourtTypeData,
};
