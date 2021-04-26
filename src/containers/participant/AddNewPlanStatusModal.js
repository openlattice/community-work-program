/*
 * @flow
 */

import React, { useState } from 'react';

import {
  List,
  Map,
  getIn,
  hasIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Modal, ModalFooter, Typography } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import { addNewDiversionPlanStatus, markDiversionPlanAsComplete } from './ParticipantActions';
import { schema, uiSchema } from './schemas/AddNewPlanStatusSchemas';

import { ENROLLMENT_STATUSES, WORKSITE_ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/actions';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import {
  APP,
  EDM,
  PERSON,
  SHARED,
  STATE,
  WORKSITE_PLANS,
} from '../../utils/constants/ReduxStateConsts';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const { getEntityKeyId } = DataUtils;
const { isPending, isSuccess } = ReduxUtils;
const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  PROGRAM_OUTCOME,
  RELATED_TO,
  RESULTS_IN,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  COMPLETED,
  DATETIME_COMPLETED,
  EFFECTIVE_DATE,
  HOURS_WORKED,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ADD_NEW_DIVERSION_PLAN_STATUS, MARK_DIVERSION_PLAN_AS_COMPLETE } = PERSON;
const { ACTIONS } = SHARED;

const successfulStatuses = [ENROLLMENT_STATUSES.COMPLETED, ENROLLMENT_STATUSES.SUCCESSFUL];

type Props = {
  isVisible :boolean;
  onClose :() => void;
};

const AddNewPlanStatusModal = ({ isVisible, onClose } :Props) => {

  const [formData, setFormData] = useState({});

  const onChange = ({ formData: updatedFormData } :Object) => {
    setFormData(updatedFormData);
  };

  const dispatch = useDispatch();

  const handleOnClose = () => {
    setFormData({});
    dispatch(resetRequestState([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS]));
    dispatch(resetRequestState([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE]));
    onClose();
  };

  const worksitePlans :List = useSelector((store) => store
    .getIn([STATE.WORKSITE_PLANS, WORKSITE_PLANS.WORKSITE_PLANS_LIST], List()));
  const selectedOrgId :string = useSelector((store) => store.getIn([STATE.APP, SELECTED_ORG_ID], ''));
  const entitySetIds :Map = useSelector((store) => store
    .getIn([STATE.APP, ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()));
  const propertyTypeIds :Map = useSelector((store) => store
    .getIn([STATE.EDM, TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()));
  const diversionPlan :Map = useSelector((store) => store.getIn([STATE.PERSON, PERSON.DIVERSION_PLAN], Map()));
  const diversionPlanEKID :?UUID = getEntityKeyId(diversionPlan);

  const onSubmit = () => {
    let updatedFormData = formData;
    const now = DateTime.local();

    const programCompletionDateKeyPath :string[] = [
      getPageSectionKey(1, 1),
      getPageSectionKey(1, 2),
      getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)
    ];
    if (hasIn(updatedFormData, programCompletionDateKeyPath)) {
      const programCompletionDateAsDateTime :string = getCombinedDateTime(
        getIn(updatedFormData, programCompletionDateKeyPath, now.toISODate()),
        now.toLocaleString(DateTime.TIME_24_SIMPLE)
      );
      updatedFormData = setIn(updatedFormData, programCompletionDateKeyPath, programCompletionDateAsDateTime);
    }

    const effectiveDateKeyPath :string[] = [
      getPageSectionKey(1, 1),
      getPageSectionKey(1, 3),
      getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)
    ];
    if (!hasIn(updatedFormData, effectiveDateKeyPath)) {
      let newEffectiveDateTime = now.toISO();
      if (hasIn(updatedFormData, programCompletionDateKeyPath)) {
        newEffectiveDateTime = getIn(updatedFormData, programCompletionDateKeyPath, now.toISO());
      }
      updatedFormData = setIn(updatedFormData, effectiveDateKeyPath, newEffectiveDateTime);
    }
    else {
      const effectiveDateAsDateTime :string = getCombinedDateTime(
        getIn(updatedFormData, effectiveDateKeyPath, now.toISODate()),
        now.toLocaleString(DateTime.TIME_24_SIMPLE)
      );
      updatedFormData = setIn(updatedFormData, effectiveDateKeyPath, effectiveDateAsDateTime);
    }

    const associations :Array<Array<*>> = [
      [RELATED_TO, 0, ENROLLMENT_STATUS, diversionPlanEKID, DIVERSION_PLAN, {}]
    ];

    // if this is the final program status:
    if (hasIn(updatedFormData, [getPageSectionKey(1, 1), getPageSectionKey(1, 2)])) {
      associations.push([RESULTS_IN, diversionPlanEKID, DIVERSION_PLAN, 0, PROGRAM_OUTCOME, {}]);

      // 1. hours worked is saved as a string and needs to be converted to number:
      const hoursWorkedPath = [
        getPageSectionKey(1, 1),
        getPageSectionKey(1, 2),
        getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)
      ];
      const hoursWorkedAsInt = parseInt(getIn(updatedFormData, hoursWorkedPath, '0'), 10);
      updatedFormData = setIn(updatedFormData, hoursWorkedPath, hoursWorkedAsInt);

      /* 2. program outcome must be marked as completed (true) if status is completed or successful,
            and not completed (false) if status is removed noncompliant or unsuccessful or closed: */
      const status = getIn(
        updatedFormData,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]
      );
      updatedFormData = setIn(
        updatedFormData,
        [getPageSectionKey(1, 1), getPageSectionKey(1, 2), getEntityAddressKey(0, PROGRAM_OUTCOME, COMPLETED)],
        successfulStatuses.includes(status) || false
      );

      // 4. work site statuses need to be updated to either completed or canceled:
      const hoursWorked = getIn(updatedFormData, hoursWorkedPath);
      const worksitePlanStatus = hoursWorked > 0
        ? WORKSITE_ENROLLMENT_STATUSES.COMPLETED
        : WORKSITE_ENROLLMENT_STATUSES.CANCELED;

      const completedDateTime = getIn(updatedFormData, programCompletionDateKeyPath);

      worksitePlans.forEach((worksitePlan :Map, index :number) => {
        updatedFormData = setIn(
          updatedFormData,
          [getPageSectionKey(1, 4), getEntityAddressKey(index + 1, ENROLLMENT_STATUS, EFFECTIVE_DATE)],
          completedDateTime
        );
        updatedFormData = setIn(
          updatedFormData,
          [getPageSectionKey(1, 4), getEntityAddressKey(index + 1, ENROLLMENT_STATUS, STATUS)],
          worksitePlanStatus,
        );

        const worksitePlanEKID :?UUID = getEntityKeyId(worksitePlan);
        associations.push([RELATED_TO, worksitePlanEKID, WORKSITE_PLAN, index + 1, ENROLLMENT_STATUS, {}]);
      });

      /* 5. in addition to submitting the new enrollment statuses and the program outcome,
            we need to update diversion plan "completed" property to true: */
      const diversionPlanESID :UUID = entitySetIds.get(DIVERSION_PLAN);
      const completedPTID :UUID = propertyTypeIds.get(COMPLETED);
      const diversionPlanDataToUpdate = {
        [diversionPlanESID]: {}
      };
      if (diversionPlanEKID) {
        diversionPlanDataToUpdate[diversionPlanESID][diversionPlanEKID] = {
          [completedPTID]: [true],
        };
      }
      dispatch(markDiversionPlanAsComplete({ entityData: diversionPlanDataToUpdate }));
    }

    const entityData :{} = processEntityData(updatedFormData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);

    dispatch(addNewDiversionPlanStatus({ associationEntityData, entityData }));
  };

  const submitRequestState = useRequestState([STATE.PERSON, ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS]);

  const withFooter = (
    <ModalFooter
        isPendingPrimary={isPending(submitRequestState)}
        onClickPrimary={onSubmit}
        onClickSecondary={handleOnClose}
        textPrimary="Submit"
        textSecondary={isSuccess(submitRequestState) ? 'Close' : 'Discard'} />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleOnClose}
        textTitle="Add New CWP Enrollment Status"
        viewportScrolling
        withFooter={withFooter}>
      <Form
          formData={formData}
          hideSubmit
          noPadding
          onChange={onChange}
          onSubmit={onSubmit}
          schema={schema}
          uiSchema={uiSchema} />
      {isSuccess(submitRequestState) && <Typography color="primary">Status successfully added!</Typography>}
    </Modal>
  );
};

export default AddNewPlanStatusModal;
