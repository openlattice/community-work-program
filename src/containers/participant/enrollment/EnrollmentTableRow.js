// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Colors, StyleUtils } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { getEnrollmentFromDiversionPlan } from '../ParticipantActions';

const { getStickyPosition } = StyleUtils;
const { NEUTRAL, PURPLE } = Colors;
const { ALL_DIVERSION_PLANS } = PERSON;

const StyledEnrollmentRow = styled.tr`
  background-color: '#fff';
  border-bottom: 1px solid ${NEUTRAL.N100};

  td,
  th {
    ${getStickyPosition}
  }

  &:hover {
    cursor: pointer;
    background: ${NEUTRAL.N100};
  }

  &:active {
    background-color: ${PURPLE.P100};
  }
`;

type Props = {
  actions:{
    getEnrollmentFromDiversionPlan :RequestSequence;
  };
  allDiversionPlans :List;
  className ? :string;
  components :Object;
  data :Object;
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
            onClick={() => this.selectDiversionPlan(id)}>
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
    getEnrollmentFromDiversionPlan,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentTableRow);
