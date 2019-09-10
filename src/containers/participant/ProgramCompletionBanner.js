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
import { DATETIME_COMPLETED, PROGRAM_OUTCOME_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';

const { DESCRIPTION, HOURS_WORKED } = PROGRAM_OUTCOME_FQNS;


const labelMap :OrderedMap = OrderedMap({
  result: 'Result',
  hoursCompleted: 'Hours completed',
  date: 'Date',
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
  display: flex;
  justify-content: space-between;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
`;

const DataGridWithMargin = styled(DataGrid)`
  margin-bottom: 10px;
`;

const BannerText = styled.div`
  color: ${OL.WHITE};
  font-size: 12px;
  /* margin-right: 30px; */
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
    const dateCompleted = DateTime.fromISO(datetimeCompleted).toLocaleString(DateTime.DATE_SHORT);

    const data :Map = fromJS({
      result: resultingStatus,
      date: dateCompleted,
      hoursCompleted: totalHoursWorked,
    });
    return (
      <Modal
          isVisible={isOutcomeReportModalVisible}
          onClose={this.hideOutcomeReportModal}
          textTitle="Program Outcome"
          viewportScrolling>
        <ModalInnerWrapper>
          <DataGridWithMargin
              columns={3}
              data={data}
              labelMap={labelMap} />
          <Label subtle>Notes</Label>
          <div>{ description }</div>
        </ModalInnerWrapper>
      </Modal>
    );
  }

  render() {
    const { programOutcome, resultingStatus } = this.props;
    const { [DATETIME_COMPLETED]: datetimeCompleted } = getEntityProperties(programOutcome, [DATETIME_COMPLETED]);
    const dateCompleted = DateTime.fromISO(datetimeCompleted).toLocaleString(DateTime.DATE_SHORT);
    const outcomeStatement = `This participant was marked ${resultingStatus} on ${dateCompleted}.`;
    return (
      <BannerWrapper>
        <Banner isOpen mode="default">
          <BannerInnerWrapper>
            <BannerText>{ outcomeStatement }</BannerText>
            <Button
                mode="default"
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
