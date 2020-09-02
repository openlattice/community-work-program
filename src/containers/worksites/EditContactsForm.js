// @flow
import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Card,
  CardHeader,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';

import {
  addWorksiteContacts,
  deleteWorksiteContact,
  editWorksiteContact,
} from './WorksitesActions';
import { contactsSchema, contactsUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getAssociations, getOriginalFormData, updateSubmittedFormData } from './utils/EditContactsUtils';

import { getEntityKeyId } from '../../utils/DataUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { SHARED, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';

const {
  getPageSectionKey,
  processEntityData,
  processAssociationEntityData,
} = DataProcessingUtils;
const { reduceRequestStates } = ReduxUtils;
const { ACTIONS } = SHARED;
const { ADD_WORKSITE_CONTACTS, DELETE_WORKSITE_CONTACT, EDIT_WORKSITE_CONTACT } = WORKSITES;

type Props = {
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  propertyTypeIds :Object;
  worksite :Map;
  worksiteContacts :List;
};

const EditContactsForm = ({
  entityIndexToIdMap,
  entitySetIds,
  propertyTypeIds,
  worksite,
  worksiteContacts,
} :Props) => {

  const prepopulated = !worksiteContacts.isEmpty();

  const [formData, updateFormData] = useState({});

  useEffect(() => {
    const originalFormData = getOriginalFormData(worksiteContacts, prepopulated);
    updateFormData(originalFormData);
  }, [prepopulated, worksiteContacts]);

  const dispatch = useDispatch();

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  const onSubmit = ({ formData: submittedFormData } :Object) => {
    const editedContactData = updateSubmittedFormData(submittedFormData);
    const worksiteEKID :UUID = getEntityKeyId(worksite);
    const associations :Array<Array<*>> = getAssociations(editedContactData[getPageSectionKey(1, 1)], worksiteEKID);
    const entityData :Object = processEntityData(editedContactData, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    dispatch(addWorksiteContacts({ associationEntityData, editedContactData, entityData }));
  };

  const handleDeleteWorksite = (params) => {
    dispatch(deleteWorksiteContact({ ...params }));
  };

  const handleEditWorksite = (params) => {
    dispatch(editWorksiteContact({ ...params }));
  };

  const formContext = {
    addActions: {
      addContact: onSubmit
    },
    deleteAction: handleDeleteWorksite,
    editAction: handleEditWorksite,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  const addRequestState = useRequestState([
    STATE.WORKSITES,
    ACTIONS,
    ADD_WORKSITE_CONTACTS,
  ]);
  const deleteRequestState = useRequestState([
    STATE.WORKSITES,
    ACTIONS,
    DELETE_WORKSITE_CONTACT,
  ]);
  const editRequestState = useRequestState([
    STATE.WORKSITES,
    ACTIONS,
    EDIT_WORKSITE_CONTACT,
  ]);
  const reducedReqState = reduceRequestStates([addRequestState, deleteRequestState, editRequestState]);

  return (
    <Card>
      <CardHeader mode="primary" padding="sm">Edit Work Site Contacts</CardHeader>
      <Form
          disabled={prepopulated}
          formContext={formContext}
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          schema={contactsSchema}
          uiSchema={contactsUiSchema} />
      { requestIsPending(reducedReqState) && <CardSegment><Spinner size="2x" /></CardSegment> }
    </Card>
  );
};

export default EditContactsForm;
