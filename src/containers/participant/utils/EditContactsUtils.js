// @flow
import { Map, setIn } from 'immutable';
import { Models } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { EDIT_FORMS_PSK } from '../schemas/SchemaConstants';

const { FQN } = Models;
const { getEntityAddressKey } = DataProcessingUtils;
const { CONTACT_INFORMATION } = APP_TYPE_FQNS;

const getContactFormData = (contact :Map, fqn :FQN) => {
  let originalFormData = {
    [EDIT_FORMS_PSK]: {}
  };

  if (contact.isEmpty()) return originalFormData;

  // $FlowFixMe
  const { [fqn]: contactVal } = getEntityProperties(contact, [fqn]);
  originalFormData = setIn(
    originalFormData,
    [EDIT_FORMS_PSK, getEntityAddressKey(0, CONTACT_INFORMATION, fqn)],
    contactVal
  );

  return originalFormData;
};

/* eslint-disable import/prefer-default-export */
export {
  getContactFormData,
};
