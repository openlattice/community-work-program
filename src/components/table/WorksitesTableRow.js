// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { StyledTableRow } from './styled/index';

import * as Routes from '../../core/router/Routes';
import { goToRoute } from '../../core/router/RoutingActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRAL } = Colors;

export const TableRow = styled(StyledTableRow)`
  border-bottom: 1px solid ${NEUTRAL.N100};

  :last-of-type {
    border-bottom: none;
  }
`;

type Props = {
  actions:{
    goToRoute :GoToRoute;
  };
  className ?:string;
  components :Object;
  data :Object;
  headers :Object[];
};

class WorksitesTableRow extends Component<Props> {

  static defaultProps = {
    className: undefined
  }

  goToWorksiteProfile = () => {
    const { actions, data } = this.props;
    const { id: worksiteEKID } = data;
    actions.goToRoute(Routes.WORKSITE_PROFILE.replace(':worksiteId', worksiteEKID));
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
      <TableRow className={className} onClick={this.goToWorksiteProfile}>
        {cells}
      </TableRow>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(WorksitesTableRow);
