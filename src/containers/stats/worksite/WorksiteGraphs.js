// @flow
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import ComingSoon from '../../../components/ComingSoon';
import { getHoursWorkedByWorksite } from '../StatsActions';

type Props = {
  actions :{
    getHoursWorkedByWorksite :RequestSequence;
  };
};

const WorksiteGraph = ({ actions }: Props) => {
  return (
    <ComingSoon />
  );
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getHoursWorkedByWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(WorksiteGraph);
