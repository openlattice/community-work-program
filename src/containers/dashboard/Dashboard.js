import React from 'react';
import styled from 'styled-components';

import DashboardContent from './DashboardContent';

const DashboardWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
`;

const DashboardInnerWrapper = styled.div`
  display: flex;
  margin: 0 30px;
  width: 990px;
  flex-direction: row;
`;

const Dashboard = () => (
  <DashboardWrapper>
    <DashboardInnerWrapper>
      <DashboardContent />
    </DashboardInnerWrapper>
  </DashboardWrapper>
);

export default Dashboard;
