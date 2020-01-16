// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AppointmentListContainer from '../../workschedule/AppointmentListContainer';

import { getEntityKeyId } from '../../../utils/DataUtils';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { ContainerOuterWrapper } from '../../../components/Layout';

const { ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE } = PERSON;

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
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
    const { getAllParticipantInfoRequestState, workAppointmentsByWorksitePlan } = this.props;
    const { isLoading } = this.state;
    const appointments :List = workAppointmentsByWorksitePlan
      .valueSeq()
      .toList()
      .flatten(1);
    const worksiteNamesByAppointmentEKID :Map = this.getWorksiteNamesMap();
    const hasSearched :boolean = getAllParticipantInfoRequestState === RequestStates.SUCCESS;
    return (
      <OuterWrapper>
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
  return ({
    getAllParticipantInfoRequestState: person.getIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE]),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(ParticipantWorkScheduleContainer);
