// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map, fromJS, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardHeader, Colors } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import { addPersonPhoto, updatePersonPhoto } from './ParticipantActions';
import { personPhotoSchema, personPhotoUiSchema } from './schemas/EditPersonAndContactsSchemas';
import { getOriginalFormData } from './utils/EditPersonPhotoUtils';

import { PersonPhoto, PersonPicture } from '../../components/picture/PersonPicture';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getImageDataFromEntity, removeDataUriPrefix } from '../../utils/BinaryUtils';
import {
  APP,
  EDM,
  PERSON,
  SHARED,
  STATE,
} from '../../utils/constants/ReduxStateConsts';

const { getEntityKeyId } = DataUtils;
const { isDefined } = LangUtils;
const { isPending, isSuccess } = ReduxUtils;
const {
  VALUE_MAPPERS,
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;
const { GREEN } = Colors;
const { IMAGE, IS_PICTURE_OF, PEOPLE } = APP_TYPE_FQNS;
const { IMAGE_DATA } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ADD_PERSON_PHOTO, UPDATE_PERSON_PHOTO } = PERSON;
const { ACTIONS } = SHARED;

const imageValueMapper = (value :any, contentType :string = 'image/png') => ({
  data: removeDataUriPrefix(value),
  'content-type': contentType,
});

const mappers = {
  [VALUE_MAPPERS]: {
    [getEntityAddressKey(0, IMAGE, IMAGE_DATA)]: imageValueMapper
  }
};

const PreviewPhotoWrapper = styled.div`
  align-self: center;
  display: flex;
  justify-content: center;
  margin: 30px 0;
`;

const SubmittedMessage = styled.div`
  align-self: center;
  color: ${GREEN.G300};
  font-weight: 600;
  padding: 0 30px 30px;
`;

type Props = {
  participant :Map;
  personPhoto :Map;
};

const EditPersonPhotoForm = ({ participant, personPhoto } :Props) => {
  const [formData, updateFormData] = useState({});

  const onChange = ({ formData: updatedFormData }) => {
    updateFormData(updatedFormData);
  };

  useEffect(() => {
    const originalFormData = getOriginalFormData(personPhoto);
    updateFormData(originalFormData);
  }, [personPhoto]);

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

  const imageEKID = getEntityKeyId(personPhoto);
  const entityIndexToIdMap :Map = fromJS({
    [IMAGE]: [imageEKID]
  });

  const dispatch = useDispatch();

  const onSubmit = () => {
    const personEKID = getEntityKeyId(participant);
    const associations :Array<Array<*>> = [
      [IS_PICTURE_OF, 0, IMAGE, personEKID, PEOPLE, {}]
    ];
    const entityData :Object = processEntityData(formData, entitySetIds, propertyTypeIds, mappers);
    const associationEntityData :Object = processAssociationEntityData(
      associations,
      entitySetIds,
      propertyTypeIds
    );
    dispatch(addPersonPhoto({ associationEntityData, entityData }));
  };

  const onEdit = () => {
    const draftWithKeys = replaceEntityAddressKeys(
      formData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const mappersWithKeys = replaceEntityAddressKeys(
      mappers,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );
    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      {},
      entitySetIds,
      propertyTypeIds,
      mappersWithKeys
    );
    dispatch(updatePersonPhoto({ entityData }));
  };

  const existingPhotoUrl = getImageDataFromEntity(personPhoto);
  const imagePreviewUrl = getIn(
    formData,
    [getPageSectionKey(1, 1), getEntityAddressKey(0, IMAGE, IMAGE_DATA)]
  ) || existingPhotoUrl;

  let submitPhotoAction = onSubmit;
  if (!personPhoto.isEmpty()) submitPhotoAction = onEdit;

  const addRequestState :?RequestState = useRequestState([STATE.PERSON, ACTIONS, ADD_PERSON_PHOTO]);
  const editRequestState :?RequestState = useRequestState([STATE.PERSON, ACTIONS, UPDATE_PERSON_PHOTO]);

  return (
    <Card>
      <CardHeader padding="sm">Add profile photo</CardHeader>
      {
        isDefined(imagePreviewUrl)
          && (
            <PreviewPhotoWrapper>
              <PersonPhoto>
                <PersonPicture src={imagePreviewUrl} />
              </PersonPhoto>
            </PreviewPhotoWrapper>
          )
      }
      <Form
          formData={formData}
          isSubmitting={isPending(addRequestState) || isPending(editRequestState)}
          onChange={onChange}
          onSubmit={submitPhotoAction}
          schema={personPhotoSchema}
          uiSchema={personPhotoUiSchema} />
      {
        (isSuccess(addRequestState) || isSuccess(editRequestState))
        && (<SubmittedMessage>Submitted!</SubmittedMessage>)
      }
    </Card>
  );
};

export default EditPersonPhotoForm;
