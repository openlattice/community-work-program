// @flow
import React, { Component } from 'react';

import { Map, fromJS } from 'immutable';
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

import {
  ButtonsRow,
  ButtonsWrapper,
  FormRow,
  RowContent,
} from '../../components/Layout';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, EDM, STATE } from '../../utils/constants/ReduxStateConsts';
import { addOrganization } from '../worksites/WorksitesActions';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData
} = DataProcessingUtils;
const { ORGANIZATION } = APP_TYPE_FQNS;
const { DESCRIPTION, ORGANIZATION_NAME } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

type Props = {
  actions:{
    addOrganization :RequestSequence;
  };
  entitySetIds :Map;
  isLoading :boolean;
  onDiscard :() => void;
  propertyTypeIds :Map;
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
      entitySetIds,
      propertyTypeIds,
    } = this.props;
    const { newOrganizationData } = this.state;

    const entityData :{} = processEntityData(newOrganizationData, entitySetIds, propertyTypeIds);
    actions.addOrganization({ associationEntityData: {}, entityData });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <CardSegment padding="small">
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

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddOrganizationForm);
