// @flow

import { ENROLLMENT_STATUSES } from '../core/edm/constants/DataModelConsts';
import { OL } from '../core/style/Colors';

/* eslint-disable import/prefer-default-export */
export const getColorForStatus = (status :string) :string => {

  let color = `${OL.GREY02}`;
  switch (status) {
    case ENROLLMENT_STATUSES.ACTIVE: {
      color = `${OL.GREEN02};`;
      break;
    }
    case ENROLLMENT_STATUSES.COMPLETED: {
      color = `${OL.BLUE01};`;
      break;
    }
    case ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT: {
      color = `${OL.YELLOW01};`;
      break;
    }
    case ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT: {
      color = `${OL.RED01};`;
      break;
    }
    case ENROLLMENT_STATUSES.AWAITING_ENROLLMENT: {
      color = `${OL.PINK01};`;
      break;
    }
    default:
      return color;
  }
  return color;
};
