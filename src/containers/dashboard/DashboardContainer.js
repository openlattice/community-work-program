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

/* DUMMY DATA */
const person = Map().withMutations((map :Map) => {
  map.set('name', 'Tommy Morrison');
  map.set('sentenceDate', '08/09/2018');
  map.set('enrollmentDeadline', '08/23/2018');
  map.set('requiredHours', '100h');
  map.set('numberViolations', 2);
});

const anotherPerson = Map().withMutations((map :Map) => {
  map.set('name', 'Mabel Garrett');
  map.set('sentenceDate', '08/06/2018');
  map.set('enrollmentDeadline', '08/20/2018');
  map.set('requiredHours', '60h');
  map.set('numberViolations', 1);
});

const people = List([
  person,
  anotherPerson,
]).asImmutable();

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: ${APP_CONTENT_PADDING}px;
  margin-top: 30px;
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
  margin: 30px 0 30px 30px;
`;

const Dashboard = () => (
  <DashboardWrapper>
    <DashboardBody>
      <NewParticipantsTable
          handleSelect={() => {}}
          people={people}
          selectedPersonId=""
          small
          totalParticipants={people.count()} />
      <RightWrapper>
        <PendingReviewParticipantsTable
            handleSelect={() => {}}
            people={people}
            selectedPersonId=""
            small
            totalParticipants={people.count()} />
        <ViolationsParticipantsTable
            handleSelect={() => {}}
            people={people}
            selectedPersonId=""
            small
            totalParticipants={people.count()} />
      </RightWrapper>
    </DashboardBody>
  </DashboardWrapper>
);

export default Dashboard;
