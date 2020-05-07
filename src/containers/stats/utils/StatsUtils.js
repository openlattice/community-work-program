// @flow
import { Map } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';

const formatReferralsCourtTypeData = (referralsByCourtTypeGraphData :Map) :Object[] => {
  const graphData :Object[] = [];
  referralsByCourtTypeGraphData.forEach((numberOfReferrals :number, courtType :string) => {
    graphData.push({ y: numberOfReferrals, x: courtType });
  });
  return graphData;
};

const formatEnrollmentStatusPeopleData = (enrollmentsByCourtType :Map) :Object[] => {
  let graphData :Object[] = [];
  enrollmentsByCourtType.forEach((numberOfParticipants :number, courtType :string) => {
    if (isDefined(numberOfParticipants) && isDefined(courtType)) {
      graphData.push({ y: courtType, x: numberOfParticipants });
    }
  });
  graphData = graphData.sort((obj1 :Object, obj2 :Object) => {
    if (obj1.x < obj2.x) return -1;
    if (obj1.x > obj2.x) return 1;
    return 0;
  });
  return graphData;
};

export {
  formatEnrollmentStatusPeopleData,
  formatReferralsCourtTypeData,
};
