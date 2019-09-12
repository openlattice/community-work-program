// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, OrderedMap, Map } from 'immutable';
import {
  Banner,
  Button,
  DataGrid,
  Label,
  Modal
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../utils/DataUtils';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { DATETIME_COMPLETED, PROGRAM_OUTCOME_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { OL } from '../../core/style/Colors';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';

const { DESCRIPTION, HOURS_WORKED } = PROGRAM_OUTCOME_FQNS;

const successfulStatuses = [ENROLLMENT_STATUSES.COMPLETED, ENROLLMENT_STATUSES.SUCCESSFUL];

const labelMap :OrderedMap = OrderedMap({
  result: 'Result',
  date: 'Date',
  hoursCompleted: 'Hours completed',
});

const BannerWrapper = styled.div`
  width: 100%;
`;

const ModalInnerWrapper = styled.div`
  width: 100%;
  padding-bottom: 30px;
`;

const BannerInnerWrapper = styled.div`
  align-items: center;
  align-self: center;
  display: flex;
  justify-content: space-between;
`;

const DataGridWithMargin = styled(DataGrid)`
  margin-bottom: 10px;
`;

const BannerText = styled.div`
  color: ${OL.WHITE};
  font-size: 12px;
`;

const NotesSection = styled.div`
  max-width: 300px;
`;

type Props = {
  programOutcome :Map;
  resultingStatus :string;
};

type State = {
  isOutcomeReportModalVisible :boolean;
};

class ProgramCompletionBanner extends Component<Props, State> {

  state = {
    isOutcomeReportModalVisible: false,
  };

  showOutcomeReportModal = () => {
    this.setState({ isOutcomeReportModalVisible: true });
  }

  hideOutcomeReportModal = () => {
    this.setState({ isOutcomeReportModalVisible: false });
  }

  renderOutcomeReportModal = () => {
    const { programOutcome, resultingStatus } = this.props;
    const { isOutcomeReportModalVisible } = this.state;
    const {
      [DATETIME_COMPLETED]: datetimeCompleted,
      [DESCRIPTION]: description,
      [HOURS_WORKED]: totalHoursWorked,
    } = getEntityProperties(programOutcome, [DATETIME_COMPLETED, DESCRIPTION, HOURS_WORKED]);

    const dateCompleted = datetimeCompleted
      ? DateTime.fromISO(datetimeCompleted).toLocaleString(DateTime.DATE_SHORT)
      : EMPTY_FIELD;
    const notes = description || EMPTY_FIELD;
    const hours = totalHoursWorked ? formatNumericalValue(totalHoursWorked) : EMPTY_FIELD;

    const data :Map = fromJS({
      date: dateCompleted,
      hoursCompleted: hours,
      result: resultingStatus,
    });
    return (
      <Modal
          isVisible={isOutcomeReportModalVisible}
          onClose={this.hideOutcomeReportModal}
          textTitle="Program Outcome"
          viewportScrolling>
        <ModalInnerWrapper>
          <DataGridWithMargin
              columns={1}
              data={data}
              labelMap={labelMap} />
          <Label subtle>Notes</Label>
          <NotesSection>{ notes }</NotesSection>
        </ModalInnerWrapper>
      </Modal>
    );
  }

  render() {
    const { programOutcome, resultingStatus } = this.props;
    const { [DATETIME_COMPLETED]: datetimeCompleted } = getEntityProperties(programOutcome, [DATETIME_COMPLETED]);
    const dateCompleted = DateTime.fromISO(datetimeCompleted).toLocaleString(DateTime.DATE_SHORT);
    const outcomeStatement = `This participant was marked ${resultingStatus} on ${dateCompleted}.`;
    const bannerMode = successfulStatuses.includes(resultingStatus) ? 'success' : 'default';
    return (
      <BannerWrapper>
        <Banner isOpen mode={bannerMode}>
          <BannerInnerWrapper>
            <BannerText>{ outcomeStatement }</BannerText>
            <Button
                fontColor={OL.WHITE}
                mode="neutral"
                onClick={this.showOutcomeReportModal}>
              View Outcome Report
            </Button>
          </BannerInnerWrapper>
        </Banner>
        { this.renderOutcomeReportModal() }
      </BannerWrapper>
    );
  }
}

export default ProgramCompletionBanner;
