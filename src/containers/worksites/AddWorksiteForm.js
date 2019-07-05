// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  CardSegment,
  DatePicker,
  Input,
  Label
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { getEntityKeyId, getEntitySetIdFromApp } from '../../utils/DataUtils';
import { processEntityData } from '../../utils/DataProcessingUtils';
import { getUTCFromDateString } from '../../utils/DateTimeUtils';
import { APP_TYPE_FQNS, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { ButtonsWrapper } from '../../components/Layout';
import { OL } from '../../core/style/Colors';

const { OPERATES, ORGANIZATION, WORKSITE } = APP_TYPE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonsRow = styled(FormRow)`
  margin-top: 20px;
`;

const RowContent = styled.div`
  flex-grow: 1;
  margin: 0 20px 10px 20px;
  min-width: 250px;
`;

const StyledTextArea = styled.textarea`
  background-color: ${OL.GREY10};
  border-radius: 3px;
  border: 1px solid ${props => (props.invalid ? OL.RED01 : OL.GREY05)};
  box-shadow: 0;
  box-sizing: border-box;
  color: ${OL.GREY01};
  display: flex;
  flex: 0 1 auto;
  font-size: 14px;
  line-height: 18px;
  padding: 10px 10px;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  width: 100%;

  :hover {
    background-color: ${OL.GREY08};
  }
  :focus {
    border: solid 1px ${OL.PURPLE02};
    background-color: white;
    outline: none;
  }
  :disabled {
    background-color: ${OL.GREY10};
    color: ${OL.GREY02};
    cursor: not-allowed;
  }
`;

type Props = {
  actions:{
    submitDataGraph :RequestSequence;
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
    const dateAsDateTime = getUTCFromDateString(date);
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

    actions.submitDataGraph({ associationEntityData, entityData });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <>
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
              <StyledTextArea
                  name={DESCRIPTION}
                  onChange={this.handleInputChange}
                  rows={3} />
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
      </>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edmPropertyTypes: state.getIn([STATE.EDM, 'typeIdsByFqn']),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    submitDataGraph,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddWorksiteForm);
