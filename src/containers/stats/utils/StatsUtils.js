// @flow
import { List, Map } from 'immutable';

import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';

const { STATUS } = PROPERTY_TYPE_FQNS;

const ACTIVE_STATUSES :string[] = [
  ENROLLMENT_STATUSES.ACTIVE,
  ENROLLMENT_STATUSES.ACTIVE_REOPENED,
  ENROLLMENT_STATUSES.AWAITING_CHECKIN,
  ENROLLMENT_STATUSES.AWAITING_ORIENTATION,
  ENROLLMENT_STATUSES.JOB_SEARCH,
];

const getCurrentlyActiveParticipants = (enrollmentByParticipant :Map, participants :List) => (
  participants.filter((participant :Map) => {
    const participantEKID :UUID = getEntityKeyId(participant);
    const enrollmentStatus :Map = enrollmentByParticipant.get(participantEKID, Map());
    const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
    return ACTIVE_STATUSES.includes(status);
  }));

/* eslint-disable import/prefer-default-export */
export {
  getCurrentlyActiveParticipants,
};
