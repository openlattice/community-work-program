// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as Routes from '../../core/router/Routes';
import { goToRoute } from '../../core/router/RoutingActions';
import { StyledTableRow } from './styled/index';
import type { GoToRoute } from '../../core/router/RoutingActions';

type Props = {
  actions:{
    goToRoute :GoToRoute;
  };
  className ? :string;
  components :Object;
  data :Object;
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
