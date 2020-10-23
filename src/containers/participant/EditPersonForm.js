// @flow
import React, { useEffect, useState } from 'react';

import { Map, fromJS } from 'immutable';
import { Form } from 'lattice-fabricate';
import { Card, CardHeader } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';

import { editPersonDetails } from './ParticipantActions';
import { personSchema, personUiSchema } from './schemas/EditPersonAndContactsSchemas';
import { getOriginalFormData } from './utils/EditPersonUtils';

import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  STATE,
} from '../../utils/constants/ReduxStateConsts';

const { getEntityKeyId } = DataUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

type Props = {
  participant :Map;
};

const EditPersonForm = ({ participant } :Props) => {
  const [formData, updateFormData] = useState({});

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const originalFormData = getOriginalFormData(participant);
    updateFormData(originalFormData);
  }, [participant]);

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

  const personEKID = getEntityKeyId(participant);
  const entityIndexToIdMap :Map = fromJS({
    [PEOPLE]: [personEKID]
  });

  const handleEditPerson = (params) => {
    dispatch(editPersonDetails({ ...params }));
  };

  const formContext = {
    editAction: handleEditPerson,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  return (
    <Card>
      <CardHeader padding="sm">Edit Person Details</CardHeader>
      <Form
          disabled
          formContext={formContext}
          formData={formData}
          onChange={onChange}
          schema={personSchema}
          uiSchema={personUiSchema} />
    </Card>
  );
};

export default EditPersonForm;
