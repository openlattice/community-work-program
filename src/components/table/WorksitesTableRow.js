// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RowData } from 'lattice-ui-kit';

import { goToRoute } from '../../core/router/RoutingActions';
import * as Routes from '../../core/router/Routes';
import { WorksitesRow } from './WorksitesHeaderRow';
import { OL } from '../../core/style/Colors';
import type { GoToRoute } from '../../core/router/RoutingActions';

export const TableRow = styled(WorksitesRow)`
  border-bottom: 1px solid ${OL.GREY05};

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
  data :RowData;
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
