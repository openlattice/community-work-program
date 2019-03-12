import React from 'react';
import styled from 'styled-components';
import { Switch } from 'react-router-dom';

const DashboardBody = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  overflow-y: auto;
`;

const DashboardContent = () => (
  <DashboardBody>
    <Switch />
  </DashboardBody>
);

export default DashboardContent;
