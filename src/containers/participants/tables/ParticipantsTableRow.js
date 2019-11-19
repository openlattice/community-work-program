// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import type { RowData } from 'lattice-ui-kit';
import type { RequestSequence } from 'redux-reqseq';

import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { StyledParticipantsRow } from './styled/index';

const { ALL_DIVERSION_PLANS } = PERSON;

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

class ParticipantsTableRow extends Component<Props> {

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
      <StyledParticipantsRow className={className}>
        {cells}
      </StyledParticipantsRow>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const person = state.get(STATE.PERSON);
  return {
    [ALL_DIVERSION_PLANS]: person.get(ALL_DIVERSION_PLANS),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(ParticipantsTableRow);
