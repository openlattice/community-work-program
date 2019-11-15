// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { StyleUtils } from 'lattice-ui-kit';
import type { RowData } from 'lattice-ui-kit';
import type { RequestSequence } from 'redux-reqseq';

// import { getEnrollmentFromDiversionPlan } from '../ParticipantActions';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_COLORS, OL } from '../../../core/style/Colors';

const { getStickyPosition, getStyleVariation } = StyleUtils;
const { ALL_DIVERSION_PLANS } = PERSON;

const statusColorVariation = getStyleVariation('status', {
  default: OL.GREY02,
  [ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [ENROLLMENT_STATUSES.ACTIVE_REOPENED]: ENROLLMENT_STATUS_COLORS.ACTIVE_REOPENED,
  [ENROLLMENT_STATUSES.AWAITING_CHECKIN]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
  [ENROLLMENT_STATUSES.AWAITING_ORIENTATION]: ENROLLMENT_STATUS_COLORS.AWAITING_ORIENTATION,
  [ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.COMPLETED,
  [ENROLLMENT_STATUSES.JOB_SEARCH]: ENROLLMENT_STATUS_COLORS.JOB_SEARCH,
  [ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT]: ENROLLMENT_STATUS_COLORS.REMOVED_NONCOMPLIANT,
  [ENROLLMENT_STATUSES.SUCCESSFUL]: ENROLLMENT_STATUS_COLORS.SUCCESSFUL,
  [ENROLLMENT_STATUSES.UNSUCCESSFUL]: ENROLLMENT_STATUS_COLORS.UNSUCCESSFUL,
});

const StyledEnrollmentRow = styled.tr`
  background-color: ${OL.WHITE};
  border-bottom: 1px solid ${OL.GREY05};
  font-size: 12px;
  color: ${statusColorVariation};
  padding: 7px 30px;

  td,
  th {
    ${getStickyPosition}
  }

  td:first-child {
    padding-left: 30px;
  }

  td:last-child {
    padding-right: 30px;
  }

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }
`;

type Props = {
  actions:{
    getEnrollmentFromDiversionPlan :RequestSequence;
  };
  allDiversionPlans :List;
  className ? :string;
  components :Object;
  data :RowData;
  headers :Object[];
};

class EnrollmentTableRow extends Component<Props> {

  static defaultProps = {
    className: undefined
  }

  selectDiversionPlan = (ekid :string) => {
    const { actions, allDiversionPlans } = this.props;
    const diversionPlan :Map = allDiversionPlans.find((plan :Map) => getEntityKeyId(plan) === ekid);

    if (isDefined(diversionPlan) && !diversionPlan.isEmpty()) {
      actions.getEnrollmentFromDiversionPlan({ diversionPlan });
    }
  }

  render() {
    const {
      className,
      components,
      data,
      headers,
    } = this.props;

    const { id } = data;

    const cells = headers
      .map((header) => (
        <components.Cell
            key={`${id}_cell_${header.key}`}
            onClick={() => this.selectDiversionPlan(id)}
            status={data[header.key]}>
          {data[header.key]}
        </components.Cell>
      ));

    return (
      <StyledEnrollmentRow className={className}>
        {cells}
      </StyledEnrollmentRow>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const person = state.get(STATE.PERSON);
  return {
    [ALL_DIVERSION_PLANS]: person.get(ALL_DIVERSION_PLANS),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    // getEnrollmentFromDiversionPlan,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentTableRow);
