// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RowData } from 'lattice-ui-kit';
import type { RequestSequence } from 'redux-reqseq';

import { goToRoute } from '../../core/router/RoutingActions';
import * as Routes from '../../core/router/Routes';
import { StyledTableRow, TableCell } from './styled/index';

export const WorksitesRow = styled(StyledTableRow)`
  ${TableCell}:first-child {
    padding-left: 50px;
    width: 300px;
    white-space: normal;
  }

  ${TableCell}:last-child {
    padding-right: 50px;
  }
`;

type Props = {
  actions:{
    goToRoute :RequestSequence;
  };
  className ? :string;
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
      <WorksitesRow className={className} onClick={this.goToWorksiteProfile}>
        {cells}
      </WorksitesRow>
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
