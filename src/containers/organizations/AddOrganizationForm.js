// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
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
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { APP_TYPE_FQNS, ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  ButtonsWrapper,
  FormRow,
  RowContent,
} from '../../components/Layout';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData
} = DataProcessingUtils;
const { ORGANIZATION } = APP_TYPE_FQNS;
const { DESCRIPTION, ORGANIZATION_NAME } = ORGANIZATION_FQNS;

type Props = {
  actions:{
    addOrganization :RequestSequence;
  };
  app :Map;
  edm :Map;
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
      newOrganizationData: fromJS({
        [getPageSectionKey(1, 1)]: {
        }
      }),
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newOrganizationData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newOrganizationData: newOrganizationData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      edm,
    } = this.props;
    const { newOrganizationData } = this.state;

    const entitySetIds :{} = {
      [ORGANIZATION]: getEntitySetIdFromApp(app, ORGANIZATION),
    };
    const propertyTypeIds :{} = {
      [DESCRIPTION]: getPropertyTypeIdFromEdm(edm, DESCRIPTION),
      [ORGANIZATION_NAME]: getPropertyTypeIdFromEdm(edm, ORGANIZATION_NAME),
    };
    const entityData :{} = processEntityData(newOrganizationData, entitySetIds, propertyTypeIds);

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
                name={getEntityAddressKey(0, ORGANIZATION, ORGANIZATION_NAME)}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Description of organization</Label>
            <TextArea
                name={getEntityAddressKey(0, ORGANIZATION, DESCRIPTION)}
                onChange={this.handleInputChange} />
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <RowContent>
            <ButtonsWrapper>
              <Button onClick={onDiscard}>Discard</Button>
            </ButtonsWrapper>
          </RowContent>
          <RowContent>
            <ButtonsWrapper>
              <Button
                  isLoading={isLoading}
                  mode="primary"
                  onClick={this.handleOnSubmit}>
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
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddOrganizationForm);
