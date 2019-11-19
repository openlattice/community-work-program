// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RowData } from 'lattice-ui-kit';
import type { RequestSequence } from 'redux-reqseq';

import { goToRoute } from '../../core/router/RoutingActions';
import * as Routes from '../../core/router/Routes';
import { StyledTableRow } from './styled/index';

type Props = {
  actions:{
    goToRoute :RequestSequence;
  };
  className ? :string;
  components :Object;
  data :RowData;
  headers :Object[];
};

class ParticipantsTableRow extends Component<Props> {

  static defaultProps = {
    className: undefined
  }

  goToPersonProfile = () => {
    const { actions, data } = this.props;
    const { id: personEKID } = data;
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
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
            status={data[header.key]}>
          {data[header.key]}
        </components.Cell>
      ));

    return (
      <StyledTableRow className={className} onClick={this.goToPersonProfile}>
        {cells}
      </StyledTableRow>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(ParticipantsTableRow);
