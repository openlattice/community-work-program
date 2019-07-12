// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  CardSegment,
  DatePicker,
  Input,
  Label,
  TextArea
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addWorksite } from './WorksitesActions';
import { getEntityKeyId, getEntitySetIdFromApp } from '../../utils/DataUtils';
import { processEntityData } from '../../utils/DataProcessingUtils';
import { APP_TYPE_FQNS, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { TYPE_IDS_BY_FQNS } from '../../core/edm/constants/DataModelConsts';
import {
  ButtonsRow,
  ButtonsWrapper,
  FormRow,
  RowContent,
} from '../../components/Layout';

const { OPERATES, ORGANIZATION, WORKSITE } = APP_TYPE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;

type Props = {
  actions:{
    addWorksite :RequestSequence;
  };
  app :Map;
  edmPropertyTypes :Map;
  isLoading :boolean;
  onDiscard :() => void;
  organization :Map;
};

type State = {
  newWorksiteData :Map;
};

class AddWorksiteForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newWorksiteData: Map(),
    };
  }

  handleDateChange = (name :FQN) => (date :string) => {
    const { newWorksiteData } = this.state;
    const splitDate :number[] = date.split('-')
      .map((string :string) => parseInt(string, 10));
    const dateAsDateTime = DateTime.local(splitDate[0], splitDate[1], splitDate[2]).toISO();
    this.setState({ newWorksiteData: newWorksiteData.set(name, dateAsDateTime) });
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newWorksiteData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newWorksiteData: newWorksiteData.set(name, value) });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      edmPropertyTypes,
      organization
    } = this.props;
    const { newWorksiteData } = this.state;

    const organizationESID :UUID = getEntitySetIdFromApp(app, ORGANIZATION);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const operatesESID :UUID = getEntitySetIdFromApp(app, OPERATES);
    const organizationEKID :UUID = getEntityKeyId(organization);

    const entityDataToProcess :Map = Map({
      entityData: newWorksiteData,
      entitySetId: worksiteESID,
    });
    const entityData :{} = processEntityData(entityDataToProcess, edmPropertyTypes);

    const associationEntityData :{} = {
      [operatesESID]: [{
        data: {},
        srcEntitySetId: organizationESID,
        srcEntityKeyId: organizationEKID,
        dstEntityIndex: 0,
        dstEntitySetId: worksiteESID
      }]
    };

    actions.addWorksite({ associationEntityData, entityData });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <CardSegment padding="small" vertical>
        <FormRow>
          <RowContent>
            <Label>Worksite name</Label>
            <Input
                name={NAME}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Description of work available</Label>
            <TextArea
                name={DESCRIPTION}
                onChange={this.handleInputChange} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent style={{ marginTop: '20px' }}>
            <Label bold>If applicable:</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Date first active</Label>
            <DatePicker
                name={DATETIME_START}
                onChange={this.handleDateChange(DATETIME_START)} />
          </RowContent>
          <RowContent>
            <Label>Date no longer active</Label>
            <DatePicker
                name={DATETIME_END}
                onChange={this.handleDateChange(DATETIME_END)} />
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <RowContent>
            <ButtonsWrapper>
              <Button onClick={onDiscard} style={{ flex: 1 }}>Discard</Button>
            </ButtonsWrapper>
          </RowContent>
          <RowContent>
            <ButtonsWrapper>
              <Button
                  isLoading={isLoading}
                  mode="primary"
                  onClick={this.handleOnSubmit}
                  style={{ flex: 1 }}>
                Submit
              </Button>
            </ButtonsWrapper>
          </RowContent>
        </ButtonsRow>
      </CardSegment>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edmPropertyTypes: state.getIn([STATE.EDM, TYPE_IDS_BY_FQNS]),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddWorksiteForm);
