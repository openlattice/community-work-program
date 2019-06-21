// @flow

import { ENROLLMENT_STATUSES } from '../core/edm/constants/DataModelConsts';
import { OL } from '../core/style/Colors';

/* eslint-disable import/prefer-default-export */
export const getColorForStatus = (status :string) :string => {
  switch (status) {
    case ENROLLMENT_STATUSES.ACTIVE: {
      return `${OL.GREEN02};`;
    }
    case ENROLLMENT_STATUSES.COMPLETED: {
      return `${OL.BLUE01};`;
    }
    case ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT: {
      return `${OL.YELLOW01};`;
    }
    case ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT: {
      return `${OL.RED01};`;
    }
    case ENROLLMENT_STATUSES.AWAITING_ENROLLMENT: {
      return `${OL.PINK01};`;
    }
    default:
      return `${OL.GREY02}`;
  }
};
