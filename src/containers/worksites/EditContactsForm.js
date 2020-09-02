// @flow
import React, { useEffect, useState } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardHeader } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';

import { addWorksiteContacts, deleteWorksiteContact, editWorksiteContact } from './WorksitesActions';
import { contactsSchema, contactsUiSchema } from './schemas/EditWorksiteInfoSchemas';
import { getAssociations, getOriginalFormData, updateSubmittedFormData } from './utils/EditContactsUtils';

import { getEntityKeyId } from '../../utils/DataUtils';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
  processAssociationEntityData,
} = DataProcessingUtils;

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
    </Card>
  );
};

export default EditContactsForm;
