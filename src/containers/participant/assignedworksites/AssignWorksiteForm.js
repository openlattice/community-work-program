// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, fromJS } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Colors,
  Input,
  Label,
  Select,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { FQN } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import { addWorksitePlan } from './WorksitePlanActions';

import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { APP, EDM, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const { RED } = Colors;
const {
  ASSIGNED_TO,
  BASED_ON,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  HAS,
  PART_OF,
  PEOPLE,
  RELATED_TO,
  WORKSITE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  DATETIME,
  EFFECTIVE_DATE,
  HOURS_WORKED,
  NAME,
  REQUIRED_HOURS,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { PLANNED } = WORKSITE_ENROLLMENT_STATUSES;

const WarningLabel = styled(Label)`
  color: ${RED.R300};
  font-weight: 600;
  margin: 0 10px;
`;

type Props = {
  actions:{
    addWorksitePlan :RequestSequence;
  };
  diversionPlanEKID :UUID;
  entitySetIds :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
  propertyTypeIds :Map;
  worksites :List;
};

type State = {
  newWorksitePlanData :Map;
  worksiteEKID :UUID;
};

class AssignWorksiteForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newWorksitePlanData: fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, WORKSITE_PLAN, HOURS_WORKED)]: 0,
          [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: PLANNED,
        },
      }),
      worksiteEKID: '',
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newWorksitePlanData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newWorksitePlanData: newWorksitePlanData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleSelectChange = (valueObj :Object) => {
    const { value } = valueObj;
    this.setState({ worksiteEKID: value });
  }

  handleOnSubmit = () => {
    const {
      actions,
      diversionPlanEKID,
      entitySetIds,
      personEKID,
      propertyTypeIds,
    } = this.props;
    const { worksiteEKID } = this.state;
    let { newWorksitePlanData } = this.state;

    // required hours is saved as a string and needs to be converted to number:
    const requiredHoursKey = getEntityAddressKey(0, WORKSITE_PLAN, REQUIRED_HOURS);
    let requiredHours = newWorksitePlanData.getIn([getPageSectionKey(1, 1), requiredHoursKey], '0');
    requiredHours = parseInt(requiredHours, 10);
    newWorksitePlanData = newWorksitePlanData.setIn([getPageSectionKey(1, 1), requiredHoursKey], requiredHours);

    const nowAsIso = DateTime.local().toISO();

    // set datetime on enrollment status:
    const enrollmentStatusKey = getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE);
    newWorksitePlanData = newWorksitePlanData.setIn([getPageSectionKey(1, 1), enrollmentStatusKey], nowAsIso);

    const associations = [];

    associations.push([ASSIGNED_TO, personEKID, PEOPLE, 0, WORKSITE_PLAN, {
      [DATETIME]: [nowAsIso]
    }]);
    associations.push([ASSIGNED_TO, personEKID, PEOPLE, worksiteEKID, WORKSITE, {
      [DATETIME]: [nowAsIso]
    }]);
    associations.push([BASED_ON, 0, WORKSITE_PLAN, worksiteEKID, WORKSITE, {}]);
    associations.push([PART_OF, 0, WORKSITE_PLAN, diversionPlanEKID, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, WORKSITE_PLAN, 0, ENROLLMENT_STATUS, {}]);
    associations.push([HAS, personEKID, PEOPLE, 0, ENROLLMENT_STATUS, {}]);

    const entityData :{} = processEntityData(newWorksitePlanData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    actions.addWorksitePlan({ associationEntityData, entityData });
  }

  setDate = (name :FQN) => (date :string) => {
    const { newWorksitePlanData } = this.state;
    this.setState({ newWorksitePlanData: newWorksitePlanData.setIn([getPageSectionKey(1, 1), name], date) });
  }

  setDateTime = (name :FQN) => (date :string) => {
    const { newWorksitePlanData } = this.state;
    const dateAsDateTime = DateTime.fromISO(date).toISO();
    this.setState({ newWorksitePlanData: newWorksitePlanData.setIn([getPageSectionKey(1, 1), name], dateAsDateTime) });
  }

  render() {
    const { isLoading, onDiscard, worksites } = this.props;

    const worksitesNames :string[] = worksites.map((site :Map) => {
      const { [NAME]: name } = getEntityProperties(site, [NAME]);
      const ekid = getEntityKeyId(site);
      return { label: name, value: ekid };
    }).toJS();

    const noWorksitesMessage = 'No work sites exist in the system. Please add one on the Worksites page first.';

    return (
      <FormWrapper>
        {
          worksites.count() > 0
            ? (
              <FormRow>
                <RowContent>
                  <Label>Work site name</Label>
                  <Select
                      name={getEntityAddressKey(0, WORKSITE, NAME)}
                      onChange={this.handleSelectChange}
                      options={worksitesNames} />
                </RowContent>
                <RowContent>
                  <Label>Required hours at work site</Label>
                  <Input
                      name={getEntityAddressKey(0, WORKSITE_PLAN, REQUIRED_HOURS)}
                      onChange={this.handleInputChange}
                      type="text" />
                </RowContent>
              </FormRow>
            )
            : (
              <FormRow>
                <RowContent>
                  <FontAwesomeIcon icon={faExclamationCircle} color={RED.R300} />
                  <WarningLabel>{ noWorksitesMessage }</WarningLabel>
                </RowContent>
              </FormRow>
            )
        }
        {
          worksites.count() > 0
            ? (
              <ButtonsRow>
                <Button onClick={onDiscard}>Discard</Button>
                <Button
                    color="primary"
                    isLoading={isLoading}
                    onClick={this.handleOnSubmit}>
                  Submit
                </Button>
              </ButtonsRow>
            )
            : null
        }
      </FormWrapper>
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
    addWorksitePlan,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AssignWorksiteForm);
