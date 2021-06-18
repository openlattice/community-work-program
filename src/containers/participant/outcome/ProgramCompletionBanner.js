// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Banner, Button, Typography } from 'lattice-ui-kit';
import { DataUtils, DateTimeUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';

import ProgramOutcomeModal from './ProgramOutcomeModal';

import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { DATETIME_COMPLETED, STATUS } = PROPERTY_TYPE_FQNS;
const { getPropertyValue } = DataUtils;
const { formatAsDate } = DateTimeUtils;

const successfulStatuses = [ENROLLMENT_STATUSES.COMPLETED, ENROLLMENT_STATUSES.SUCCESSFUL];

const BannerWrapper = styled.div`
  width: 100%;
`;

const BannerInnerWrapper = styled.div`
  align-items: center;
  align-self: center;
  color: 'white';
  display: flex;
  justify-content: space-between;

  button {
    margin-left: 10px;
  }
`;

const ProgramCompletionBanner = () => {

  const [isModalVisible, setModalVisibility] = useState(false);

  const enrollmentStatus :Map = useSelector((store) => store.getIn([STATE.PERSON, PERSON.ENROLLMENT_STATUS]));
  const programOutcome :Map = useSelector((store) => store.getIn([STATE.PERSON, PERSON.PROGRAM_OUTCOME]));

  const dateTimeCompleted = getPropertyValue(programOutcome, [DATETIME_COMPLETED, 0]);
  const dateCompleted = DateTime.fromISO(dateTimeCompleted);
  const date :string = formatAsDate(dateTimeCompleted);

  const resultingStatus = getPropertyValue(enrollmentStatus, [STATUS, 0]);

  const outcomeStatement :string = dateCompleted.isValid
    ? `This participant was marked ${resultingStatus} on ${date}.`
    : `This participant was marked ${resultingStatus}.`;

  const bannerMode = successfulStatuses.includes(resultingStatus) ? 'success' : 'default';

  return (
    <BannerWrapper>
      <Banner isOpen mode={bannerMode}>
        <BannerInnerWrapper>
          <Typography>{ outcomeStatement }</Typography>
          <Button color="inherit" onClick={() => setModalVisibility(true)} variant="text">
            View Outcome Report
          </Button>
        </BannerInnerWrapper>
      </Banner>
      <ProgramOutcomeModal isVisible={isModalVisible} onClose={() => setModalVisibility(false)} />
    </BannerWrapper>
  );
};

export default ProgramCompletionBanner;
