// @flow
import React, { useEffect, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { Map, fromJS } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardHeader } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import { ADD_PERSON_PHONE, addPersonPhone, editPersonPhone } from './PersonContactsActions';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  SHARED,
  STATE
} from '../../../utils/constants/ReduxStateConsts';
import { phoneSchema, phoneUiSchema } from '../schemas/EditPersonAndContactsSchemas';
import { getContactFormData } from '../utils/EditContactsUtils';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const {
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { isPending } = ReduxUtils;
const { CONTACT_INFORMATION, CONTACT_INFO_GIVEN, PEOPLE } = APP_TYPE_FQNS;
const { PHONE_NUMBER } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ACTIONS } = SHARED;

type Props = {
  participant :Map;
  phone :Map;
};

const EditPhoneForm = ({ participant, phone } :Props) => {
  const [formData, updateFormData] = useState({});

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const originalFormData = getContactFormData(phone, PHONE_NUMBER);
    updateFormData(originalFormData);
  }, [phone]);

  const dispatch = useDispatch();

  const selectedOrgId :string = useSelector((store :Map) => store.getIn([STATE.APP, SELECTED_ORG_ID]));
  const entitySetIds :Map = useSelector((store :Map) => store.getIn([
    STATE.APP,
    ENTITY_SET_IDS_BY_ORG,
    selectedOrgId
  ], Map()));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn([
    STATE.EDM,
    TYPE_IDS_BY_FQNS,
    PROPERTY_TYPES
  ], Map()));

  const phoneEKID = getEntityKeyId(phone);
  const entityIndexToIdMap :Map = fromJS({
    [CONTACT_INFORMATION]: [phoneEKID]
  });

  const personEKID = getEntityKeyId(participant);

  const onSubmit = ({ formData: submittedFormData }) => {
    if ((!isDefined(phone) || phone.isEmpty())
      && !isEmpty(submittedFormData[getPageSectionKey(1, 1)])) {
      const entityData = processEntityData(submittedFormData, entitySetIds, propertyTypeIds);
      const associations = [[CONTACT_INFO_GIVEN, 0, CONTACT_INFORMATION, personEKID, PEOPLE]];
      const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
      dispatch(addPersonPhone({ associationEntityData, entityData }));
    }
  };

  const handleEditAddress = (params) => {
    dispatch(editPersonPhone({ ...params }));
  };

  const addRequestState :?RequestState = useRequestState([STATE.PERSON_CONTACTS, ACTIONS, ADD_PERSON_PHONE]);

  const formContext :Object = {
    editAction: handleEditAddress,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  return (
    <Card>
      <CardHeader padding="sm">Edit Phone</CardHeader>
      <Form
          disabled={!phone.isEmpty()}
          formContext={formContext}
          formData={formData}
          isSubmitting={isPending(addRequestState)}
          onChange={onChange}
          onSubmit={onSubmit}
          schema={phoneSchema}
          uiSchema={phoneUiSchema} />
    </Card>
  );
};

export default EditPhoneForm;
