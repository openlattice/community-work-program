// @flow

import React, { Component } from 'react';
import type { Element } from 'react';
import styled from 'styled-components';
import {
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  IconButton,
  Label,
} from 'lattice-ui-kit';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';

import EditInfractionModal from './EditInfractionModal';
import DeleteInfractionModal from './DeleteInfractionModal';

import * as Routes from '../../../core/router/Routes';
import { goToRoute } from '../../../core/router/RoutingActions';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { formatAsDate, formatAsTime } from '../../../utils/DateTimeUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';
import { OL } from '../../../core/style/Colors';

const { WORKSITE_PLAN } = APP_TYPE_FQNS;
const {
  CATEGORY,
  DATETIME_COMPLETED,
  NAME,
  NOTES,
  STATUS,
  TYPE,
} = PROPERTY_TYPE_FQNS;

const labelMap :OrderedMap = OrderedMap({
  infractionType: 'Infraction type',
  category: 'Infraction category',
  worksiteName: 'Work Site, if applicable',
  date: 'Date',
  time: 'Time',
  status: 'Resulting enrollment status, if any',
});

const EDIT_INFRACTION_MODAL = 'isEditInfractionModalVisible';
const DELETE_INFRACTION_MODAL = 'isDeleteInfractionModalVisible';

const NotesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ButtonsWrapper = styled.div`
  align-self: flex-end;
  display: grid;
  grid-gap: 0 10px;
  grid-template-columns: repeat(3, 1fr);
  height: 40px;
  margin-bottom: 20px;
`;

type Props = {
  actions:{
    goToRoute :RequestSequence;
  };
  controls :Element<*>;
  infraction :Map;
  infractionInfo :Map;
  participant :Map;
  worksitesByWorksitePlan :Map;
};

type State = {
  isEditInfractionModalVisible :boolean;
  isDeleteInfractionModalVisible :boolean;
};

class InfractionDisplay extends Component<Props, State> {

  state = {
    isEditInfractionModalVisible: false,
    isDeleteInfractionModalVisible: false,
  };

  goToPrintInfraction = () => {
    const { actions, infraction, participant } = this.props;
    const personEKID :UUID = getEntityKeyId(participant);
    const infractionEventEKID :UUID = getEntityKeyId(infraction);
    actions.goToRoute(Routes.PRINT_INFRACTION
      .replace(':subjectId', personEKID)
      .replace(':infractionId', infractionEventEKID));
  }

  handleShowModal = (modalName :string) => {
    this.setState({ [modalName]: true });
  }

  handleHideModal = (modalName :string) => {
    this.setState({ [modalName]: false });
  }

  render() {
    const {
      controls,
      infraction,
      infractionInfo,
      worksitesByWorksitePlan,
    } = this.props;
    const { isEditInfractionModalVisible, isDeleteInfractionModalVisible } = this.state;

    const {
      [DATETIME_COMPLETED]: infractionDateTime,
      [NOTES]: infractionNotes,
      [TYPE]: infractionType
    } = getEntityProperties(infraction, [DATETIME_COMPLETED, NOTES, TYPE]);
    const date :string = infractionDateTime ? formatAsDate(infractionDateTime) : EMPTY_FIELD;
    const time :string = infractionDateTime ? formatAsTime(infractionDateTime) : EMPTY_FIELD;
    const notes :string = !infractionNotes ? EMPTY_FIELD : infractionNotes;

    const infractionCategory :string = infractionInfo ? infractionInfo.get(CATEGORY, '') : '';
    const category = !infractionCategory ? EMPTY_FIELD : infractionCategory;

    const worksiteEntity :Map = infractionInfo ? worksitesByWorksitePlan.get(infractionInfo.get(WORKSITE_PLAN)) : Map();
    let { [NAME]: worksiteName } = getEntityProperties(worksiteEntity, [NAME]);
    worksiteName = !worksiteName ? EMPTY_FIELD : worksiteName;
    const status :string = (infractionInfo ? infractionInfo.get(STATUS, '') : '') || EMPTY_FIELD;
    const data :List = fromJS({
      category,
      date,
      infractionType,
      status,
      time,
      worksiteName,
    });

    return (
      <Card>
        { controls }
        <CardSegment padding="sm" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
          <BottomRow>
            <NotesWrapper>
              <Label subtle>Notes</Label>
              <span>{ notes }</span>
            </NotesWrapper>
            <ButtonsWrapper>
              <IconButton
                  icon={<FontAwesomeIcon icon={faPrint} color={OL.GREY02} />}
                  onClick={this.goToPrintInfraction} />
              <EditButton onClick={() => this.handleShowModal(EDIT_INFRACTION_MODAL)} />
              <IconButton
                  icon={<FontAwesomeIcon icon={faTrash} color={OL.GREY02} />}
                  onClick={() => this.handleShowModal(DELETE_INFRACTION_MODAL)} />
            </ButtonsWrapper>
          </BottomRow>
        </CardSegment>
        <EditInfractionModal
            infractionEvent={infraction}
            infractionCategory={infractionCategory}
            isOpen={isEditInfractionModalVisible}
            onClose={() => this.handleHideModal(EDIT_INFRACTION_MODAL)} />
        <DeleteInfractionModal
            infractionEventEKID={getEntityKeyId(infraction)}
            isOpen={isDeleteInfractionModalVisible}
            onClose={() => this.handleHideModal(DELETE_INFRACTION_MODAL)} />
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(InfractionDisplay);
