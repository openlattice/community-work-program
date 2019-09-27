// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  Card,
  CardSegment,
  EditButton,
  StyleUtils,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from '@fortawesome/pro-light-svg-icons';

import EditWorksitePlanModal from './EditWorksitePlanModal';

import { getEntityProperties } from '../../../utils/DataUtils';
import {
  ENROLLMENT_STATUS_FQNS,
  WORKSITE_FQNS,
  WORKSITE_PLAN_FQNS
} from '../../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_COLORS, OL } from '../../../core/style/Colors';

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { NAME } = WORKSITE_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const { getStyleVariation } = StyleUtils;

const statusColorVariation = getStyleVariation('color', {
  default: OL.GREY02,
  [WORKSITE_ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [WORKSITE_ENROLLMENT_STATUSES.CANCELED]: OL.GREY02,
  [WORKSITE_ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.SUCCESSFULLY_COMPLETED,
  [WORKSITE_ENROLLMENT_STATUSES.ON_HOLD]: OL.YELLOW01,
  [WORKSITE_ENROLLMENT_STATUSES.PLANNED]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
});

const OuterWrapper = styled.div`
  width: 100%;
`;

const AppointmentCardSegment = styled(CardSegment)`
  display: flex;
  justify-content: space-between;
`;

const InnerWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 140px 140px 140px 140px;
  grid-gap: 5px 30px;
  min-height: 40px;
`;

const Text = styled.span`
  align-items: center;
  color: ${statusColorVariation};
  display: flex;
  font-size: 14px;
`;

type Props = {
  status :Map;
  worksite :Map;
  worksitePlan :Map;
};

type State = {
  isEditModalVisible :boolean;
  hours :string;
  statusName :string;
};

class AssignedWorksiteContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const propsStatus :string = this.getStatusFromProps(props);
    const propsHours :string = this.getHoursFromProps(props);
    this.state = {
      isEditModalVisible: false,
      hours: propsHours,
      statusName: propsStatus,
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { hours, statusName } = this.state;

    const propsStatus :string = this.getStatusFromProps(prevProps);
    const propsHours :string = this.getHoursFromProps(prevProps);

    if (propsStatus !== statusName) {
      this.setPropsToState('statusName', propsStatus);
    }
    if (propsHours !== hours) {
      this.setPropsToState('hours', propsHours);
    }
  }

  setPropsToState = (stateName :string, value :string) => (
    this.setState({ [stateName]: value })
  );

  getStatusFromProps = (props :Props) => {
    const { [STATUS]: worksitePlanStatus } = getEntityProperties(props.status, [STATUS]);
    return worksitePlanStatus;
  }

  getHoursFromProps = (props :Props) => {
    const {
      [HOURS_WORKED]: hoursWorked,
      [REQUIRED_HOURS]: requiredHours
    } = getEntityProperties(props.worksitePlan, [HOURS_WORKED, REQUIRED_HOURS]);
    const totalHours = `${hoursWorked} / ${requiredHours} hrs`;
    return totalHours;
  }

  showEditModal = () => {
    this.setState({ isEditModalVisible: true });
  }

  hideEditModal = () => {
    this.setState({ isEditModalVisible: false });
  }

  render() {
    const { worksite, worksitePlan } = this.props;
    const { isEditModalVisible, hours, statusName } = this.state;
    const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
    return (
      <OuterWrapper>
        <Card>
          <AppointmentCardSegment padding="sm">
            <InnerWrapper>
              <Text>
                <FontAwesomeIcon icon={faTools} size="sm" />
              </Text>
              <Text>{ worksiteName }</Text>
              <Text color={statusName}>{ statusName }</Text>
              <Text>{ hours }</Text>
            </InnerWrapper>
            <EditButton mode="subtle" onClick={this.showEditModal} />
          </AppointmentCardSegment>
        </Card>
        <EditWorksitePlanModal
            isOpen={isEditModalVisible}
            onClose={this.hideEditModal}
            worksitePlan={worksitePlan}
            worksitePlanStatus={statusName} />
      </OuterWrapper>
    );
  }
}

export default AssignedWorksiteContainer;
