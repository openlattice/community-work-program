// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Switch } from 'react-router-dom';

import NewParticipantsTable from '../../components/table/NewParticipantsTable';
import PendingReviewParticipantsTable from '../../components/table/PendingReviewParticipantsTable';
import ViolationsParticipantsTable from '../../components/table/ViolationsParticipantsTable';

import {
  APP_CONTENT_PADDING,
  DASHBOARD_WIDTH,
} from '../../core/style/Sizes';
import { people } from './FakeData';

/* styled components */
const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: ${APP_CONTENT_PADDING}px;
  width: ${DASHBOARD_WIDTH};
  position: relative;
  align-self: center;
`;

const DashboardBody = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow-y: auto;
`;

const RightWrapper = styled.div`
  width: 600px;
  display: flex;
  flex-direction: column;
  margin: 0 0 30px 30px;
`;

/* constants */
const newParticipants = people.filter((person :Map) => person.get('status') === 'Awaiting enrollment');
const pendingCompletionReview = people.filter((person :Map) => (
  person.get('status').includes('Active') && person.get('requiredHours') === person.get('hoursServed')
));
const violationsWatch = people.filter((person :Map) => (
  person.get('numberOfViolations') > 0 && person.get('status').includes('Active')
));

/* react component */
const Dashboard = () => (
  <DashboardWrapper>
    <DashboardBody>
      <NewParticipantsTable
          handleSelect={() => {}}
          people={newParticipants}
          selectedPersonId=""
          small
          totalParticipants={newParticipants.count()} />
      <RightWrapper>
        <PendingReviewParticipantsTable
            handleSelect={() => {}}
            people={pendingCompletionReview}
            selectedPersonId=""
            small
            totalParticipants={pendingCompletionReview.count()} />
        <ViolationsParticipantsTable
            handleSelect={() => {}}
            people={violationsWatch}
            selectedPersonId=""
            small
            totalParticipants={violationsWatch.count()} />
      </RightWrapper>
    </DashboardBody>
  </DashboardWrapper>
);

export default Dashboard;
