// @flow
import React, { useEffect, useState } from 'react';

import {
  Map,
  fromJS,
  getIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal } from 'lattice-ui-kit';
import { DataUtils, LangUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';

import { editProgramOutcome } from './ProgramOutcomeActions';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  PERSON,
  STATE
} from '../../../utils/constants/ReduxStateConsts';
import { schema, uiSchema } from '../schemas/ProgramOutcomeSchemas';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ENROLLMENT_STATUS, PROGRAM_OUTCOME } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DESCRIPTION,
  EFFECTIVE_DATE,
  HOURS_WORKED,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isDefined } = LangUtils;

type Props = {
  isVisible :boolean;
  onClose :() => void;
};

const ProgramOutcomeModal = ({ isVisible, onClose } :Props) => {

  const enrollmentStatus :Map = useSelector((store) => store.getIn([STATE.PERSON, PERSON.ENROLLMENT_STATUS]));
  const programOutcome :Map = useSelector((store) => store.getIn([STATE.PERSON, PERSON.PROGRAM_OUTCOME]));

  const status = getPropertyValue(enrollmentStatus, [STATUS, 0]);
  const dateCompleted = DateTime.fromISO(getPropertyValue(programOutcome, [DATETIME_COMPLETED, 0])).toISODate();
  const hoursWorked = getPropertyValue(programOutcome, [HOURS_WORKED, 0]);
  const notes = getPropertyValue(programOutcome, [DESCRIPTION, 0]);

  const [formData, updateFormData] = useState({});

  const onChange = ({ formData: newFormData } :Object) => {
    updateFormData(newFormData);
  };

  useEffect(() => {
    const originalFormData = {
      [getPageSectionKey(1, 1)]: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: status,
        [getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)]: dateCompleted,
        [getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)]: hoursWorked,
        [getEntityAddressKey(0, PROGRAM_OUTCOME, DESCRIPTION)]: notes,
      }
    };
    updateFormData(originalFormData);
  }, [status, dateCompleted, hoursWorked, notes]);

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

  const enrollmentStatusEKID = getEntityKeyId(enrollmentStatus);
  const programOutcomeEKID = getEntityKeyId(programOutcome);

  const entityIndexToIdMap :Map = fromJS({
    [ENROLLMENT_STATUS]: [enrollmentStatusEKID],
    [PROGRAM_OUTCOME]: [programOutcomeEKID],
  });

  const dispatch = useDispatch();

  const handleEditProgramOutcome = (params) => {

    const programOutcomeESID = entitySetIds.get(PROGRAM_OUTCOME);
    const dateTimeCompletedPTID = propertyTypeIds.get(DATETIME_COMPLETED);
    const programDatePath = [programOutcomeESID, programOutcomeEKID, dateTimeCompletedPTID, 0];

    const { entityData } = params;
    let newEntityData = { ...entityData };
    const newDateCompleted = getIn(entityData, programDatePath);

    if (newDateCompleted) {
      const now = DateTime.local();
      const dateTimeCompleted = DateTime.fromSQL(`${newDateCompleted} ${now.toISOTime()}`).toISO();
      newEntityData = setIn(newEntityData, programDatePath, dateTimeCompleted);

      const enrollmentStatusESID = entitySetIds.get(ENROLLMENT_STATUS);
      const effectiveDatePTID = propertyTypeIds.get(EFFECTIVE_DATE);
      newEntityData = setIn(
        newEntityData,
        [enrollmentStatusESID, enrollmentStatusEKID, effectiveDatePTID],
        [dateTimeCompleted]
      );
    }

    const hoursWorkedPTID = propertyTypeIds.get(HOURS_WORKED);
    const hoursWorkedPath = [programOutcomeESID, programOutcomeEKID, hoursWorkedPTID, 0];
    const newHoursWorked = getIn(entityData, hoursWorkedPath);

    if (isDefined(newHoursWorked)) {
      const newHoursWorkedAsFloat = parseFloat(newHoursWorked);
      newEntityData = setIn(newEntityData, hoursWorkedPath, newHoursWorkedAsFloat);
    }

    dispatch(editProgramOutcome({
      ...params,
      enrollmentStatusEKID,
      entityData: newEntityData,
      programOutcomeEKID,
    }));
  };

  const formContext = {
    editAction: handleEditProgramOutcome,
    entityIndexToIdMap,
    entitySetIds,
    propertyTypeIds,
  };

  return (
    <Modal
        isVisible={isVisible}
        onClickSecondary={onClose}
        onClose={onClose}
        textSecondary="Close"
        textTitle="Program Outcome"
        viewportScrolling>
      <Form
          disabled
          formContext={formContext}
          formData={formData}
          noPadding
          onChange={onChange}
          schema={schema}
          uiSchema={uiSchema} />
    </Modal>
  );
};

export default ProgramOutcomeModal;
