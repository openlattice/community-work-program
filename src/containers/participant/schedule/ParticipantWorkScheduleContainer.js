/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import WeeklyHoursBreakdown from './WeeklyHoursBreakdown';

import AppointmentListContainer from '../../workschedule/AppointmentListContainer';
import { ContainerOuterWrapper } from '../../../components/Layout';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { PERSON, STATE, WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';

const { CHECK_INS_BY_APPOINTMENT } = WORKSITE_PLANS;
const { ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE } = PERSON;

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
  checkInsByAppointment :Map;
  getAllParticipantInfoRequestState :RequestState;
  workAppointmentsByWorksitePlan :Map;
  worksiteNamesByWorksitePlan :Map;
};

type State = {
  isLoading :boolean;
};

class ParticipantWorkScheduleContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: false }); /* HACK ALERT */
  }

  getWorksiteNamesMap = () => {
    const { workAppointmentsByWorksitePlan, worksiteNamesByWorksitePlan } = this.props;
    const worksiteNamesByAppointmentEKID = Map().withMutations((map :Map) => {
      workAppointmentsByWorksitePlan.forEach((apptList :List, worksitePlanEKID :UUID) => {
        apptList.forEach((appt :Map) => {
          const apptEKID :UUID = getEntityKeyId(appt);
          const apptWorksiteName = worksiteNamesByWorksitePlan.get(worksitePlanEKID);
          map.set(apptEKID, apptWorksiteName);
        });
      });
    });
    return worksiteNamesByAppointmentEKID;
  }

  render() {
    const { checkInsByAppointment, getAllParticipantInfoRequestState, workAppointmentsByWorksitePlan } = this.props;
    const { isLoading } = this.state;
    const appointments :List = workAppointmentsByWorksitePlan
      .valueSeq()
      .toList()
      .flatten(1);
    const worksiteNamesByAppointmentEKID :Map = this.getWorksiteNamesMap();
    const hasSearched :boolean = getAllParticipantInfoRequestState === RequestStates.SUCCESS;
    return (
      <OuterWrapper>
        { !checkInsByAppointment.isEmpty() && (
          <WeeklyHoursBreakdown appointments={appointments} checkInsByAppointment={checkInsByAppointment} />
        )}
        <AppointmentListContainer
            appointments={appointments}
            hasSearched={hasSearched}
            isLoading={isLoading}
            worksiteNamesByAppointmentEKID={worksiteNamesByAppointmentEKID} />
      </OuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  return ({
    [CHECK_INS_BY_APPOINTMENT]: worksitePlans.get(CHECK_INS_BY_APPOINTMENT),
    getAllParticipantInfoRequestState: person.getIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE]),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(ParticipantWorkScheduleContainer);
