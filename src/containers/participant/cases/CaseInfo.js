// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';
import { faEdit } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EditCaseAndHoursModal from './EditCaseAndHoursModal';

import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';
import { formatNumericalValue } from '../../../utils/FormattingUtils';
import { CASE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { OL } from '../../../core/style/Colors';

const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;

const CaseInfoWrapper = styled.div`
  width: 100%;
`;

const IconWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
`;

const labelMap :OrderedMap = OrderedMap({
  courtType: 'Court type',
  docketNumber: 'Docket number',
  reqHours: 'Required hours',
  warnings: 'Warnings',
  violations: 'Violations',
});

type Props = {
  personCase :string;
  hours :number;
  violations :List;
  warnings :List;
};

type State = {
  isEditModalVisible :boolean;
};

class CaseInfo extends Component<Props, State> {

  state = {
    isEditModalVisible: false,
  };

  handleShowEditModal = () => {
    this.setState({
      isEditModalVisible: true,
    });
  }

  handleHideEditModal = () => {
    this.setState({
      isEditModalVisible: false,
    });
  }

  render() {
    const {
      personCase,
      hours,
      violations,
      warnings,
    } = this.props;
    const { isEditModalVisible } = this.state;

    const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
      personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
    );
    const courtType = !courtCaseType ? EMPTY_FIELD : courtCaseType;
    const docketNumber = !caseNumbers ? EMPTY_FIELD : caseNumbers;
    const warningsCount = formatNumericalValue(warnings.count());
    const violationsCount = formatNumericalValue(violations.count());
    const data :Map = fromJS({
      courtType,
      docketNumber,
      reqHours: formatNumericalValue(hours),
      warnings: warningsCount,
      violations: violationsCount,
    });
    return (
      <CaseInfoWrapper>
        <Card>
          <CardSegment padding="md">
            <DataGrid
                columns={3}
                data={data}
                labelMap={labelMap} />
            <IconWrapper onClick={this.handleShowEditModal}>
              <FontAwesomeIcon color={OL.GREY02} icon={faEdit} size="sm" />
            </IconWrapper>
          </CardSegment>
        </Card>
        <EditCaseAndHoursModal
            isOpen={isEditModalVisible}
            onClose={this.handleHideEditModal} />
      </CaseInfoWrapper>
    );
  }
}

export default CaseInfo;
