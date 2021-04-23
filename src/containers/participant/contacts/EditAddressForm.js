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

import {
  ADD_PERSON_ADDRESS,
  addPersonAddress,
  editPersonAddress,
} from './PersonContactsActions';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  SHARED,
  STATE,
} from '../../../utils/constants/ReduxStateConsts';
import { addressSchema, addressUiSchema } from '../schemas/EditPersonAndContactsSchemas';
import { getOriginalFormData } from '../utils/EditAddressUtils';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const { isPending } = ReduxUtils;
const {
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { ADDRESS, LOCATED_AT, PEOPLE } = APP_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ACTIONS } = SHARED;

type Props = {
  address :Map;
  participant :Map;
};

const EditAddressForm = ({ address, participant } :Props) => {
  const [formData, updateFormData] = useState({});

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const originalFormData = getOriginalFormData(address);
    updateFormData(originalFormData);
  }, [address]);

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

  const addressEKID = getEntityKeyId(address);
  const entityIndexToIdMap :Map = fromJS({
    [ADDRESS]: [addressEKID]
  });

  const personEKID = getEntityKeyId(participant);

  const onSubmit = ({ formData: submittedFormData }) => {
    if ((!isDefined(address) || address.isEmpty())
      && !isEmpty(submittedFormData[getPageSectionKey(1, 1)])) {
      const entityData = processEntityData(submittedFormData, entitySetIds, propertyTypeIds);
      const associations :Array<Array<*>> = [[LOCATED_AT, personEKID, PEOPLE, 0, ADDRESS]];
      const associationEntityData = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
      dispatch(addPersonAddress({ associationEntityData, entityData }));
    }
  };

  const handleEditAddress = (params) => {
    dispatch(editPersonAddress({ ...params }));
  };

  const addRequestState :?RequestState = useRequestState([STATE.PERSON_CONTACTS, ACTIONS, ADD_PERSON_ADDRESS]);

  const formContext :Object = {
    editAction: handleEditAddress,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  return (
    <Card>
      <CardHeader padding="sm">Edit Address</CardHeader>
      <Form
          disabled={!address.isEmpty()}
          formContext={formContext}
          formData={formData}
          isSubmitting={isPending(addRequestState)}
          onChange={onChange}
          onSubmit={onSubmit}
          schema={addressSchema}
          uiSchema={addressUiSchema} />
    </Card>
  );
};

export default EditAddressForm;
