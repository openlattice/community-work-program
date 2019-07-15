// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import {
  Button,
  CardSegment,
  Input,
  Label,
  TextArea,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addOrganization } from '../worksites/WorksitesActions';
import { getEntitySetIdFromApp } from '../../utils/DataUtils';
import { processEntityData } from '../../utils/DataProcessingUtils';
import { APP_TYPE_FQNS, ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { TYPE_IDS_BY_FQNS } from '../../core/edm/constants/DataModelConsts';
import {
  ButtonsRow,
  ButtonsWrapper,
  FormRow,
  RowContent,
} from '../../components/Layout';

const { ORGANIZATION } = APP_TYPE_FQNS;
const { DESCRIPTION, ORGANIZATION_NAME } = ORGANIZATION_FQNS;

type Props = {
  actions:{
    addOrganization :RequestSequence;
  };
  app :Map;
  edmPropertyTypes :Map;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  newOrganizationData :Map;
};

class AddOrganizationForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newOrganizationData: Map(),
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newOrganizationData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newOrganizationData: newOrganizationData.set(name, value) });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      edmPropertyTypes,
    } = this.props;
    const { newOrganizationData } = this.state;

    const organizationESID :UUID = getEntitySetIdFromApp(app, ORGANIZATION);

    const entityDataToProcess :Map = Map({
      entityData: newOrganizationData,
      entitySetId: organizationESID,
    });
    const entityData :{} = processEntityData(entityDataToProcess, edmPropertyTypes);

    actions.addOrganization({ associationEntityData: {}, entityData });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <CardSegment padding="small" vertical>
        <FormRow>
          <RowContent>
            <Label>Organization name</Label>
            <Input
                name={ORGANIZATION_NAME}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Description of organization</Label>
            <TextArea
                name={DESCRIPTION}
                onChange={this.handleInputChange} />
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
    addOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddOrganizationForm);
