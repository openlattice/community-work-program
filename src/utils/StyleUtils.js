// @flow

import { ENROLLMENT_STATUSES } from '../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_COLORS, OL } from '../core/style/Colors';

/* eslint-disable import/prefer-default-export */
export const getColorForStatus = (status :string) :string => {
  switch (status) {
    case ENROLLMENT_STATUSES.ACTIVE: {
      return ENROLLMENT_STATUS_COLORS.ACTIVE;
    }
    case ENROLLMENT_STATUSES.COMPLETED: {
      return ENROLLMENT_STATUS_COLORS.COMPLETED;
    }
    case ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT: {
      return ENROLLMENT_STATUS_COLORS.ACTIVE_NONCOMPLIANT;
    }
    case ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT: {
      return ENROLLMENT_STATUS_COLORS.REMOVED_NONCOMPLIANT;
    }
    case ENROLLMENT_STATUSES.AWAITING_ENROLLMENT: {
      return ENROLLMENT_STATUS_COLORS.AWAITING_ENROLLMENT;
    }
    default:
      return `${OL.GREY02}`;
  }
};
