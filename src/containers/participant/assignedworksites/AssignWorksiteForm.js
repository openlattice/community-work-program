// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Input,
  Label,
  Select,
} from 'lattice-ui-kit';
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addWorksitePlan } from './WorksitePlanActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  DATETIME,
  DATETIME_START,
  ENROLLMENT_STATUS_FQNS,
  WORKSITE_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { OL } from '../../../core/style/Colors';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
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
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { NAME } = WORKSITE_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const { PLANNED } = WORKSITE_ENROLLMENT_STATUSES;

const WarningLabel = styled(Label)`
  color: ${OL.RED01};
  font-weight: 600;
  margin: 0 10px;
`;

type Props = {
  actions:{
    addWorksitePlan :RequestSequence;
  };
  app :Map;
  diversionPlanEKID :UUID;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
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
      app,
      diversionPlanEKID,
      edm,
      personEKID,
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

    const entitySetIds :Object = {
      [ASSIGNED_TO]: getEntitySetIdFromApp(app, ASSIGNED_TO),
      [BASED_ON]: getEntitySetIdFromApp(app, BASED_ON),
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
      [ENROLLMENT_STATUS]: getEntitySetIdFromApp(app, ENROLLMENT_STATUS),
      [HAS]: getEntitySetIdFromApp(app, HAS),
      [PART_OF]: getEntitySetIdFromApp(app, PART_OF),
      [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
      [RELATED_TO]: getEntitySetIdFromApp(app, RELATED_TO),
      [WORKSITE]: getEntitySetIdFromApp(app, WORKSITE),
      [WORKSITE_PLAN]: getEntitySetIdFromApp(app, WORKSITE_PLAN),
    };
    const propertyTypeIds :Object = {
      [DATETIME]: getPropertyTypeIdFromEdm(edm, DATETIME),
      [DATETIME_START]: getPropertyTypeIdFromEdm(edm, DATETIME_START),
      [EFFECTIVE_DATE]: getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE),
      [HOURS_WORKED]: getPropertyTypeIdFromEdm(edm, HOURS_WORKED),
      [REQUIRED_HOURS]: getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS),
      [STATUS]: getPropertyTypeIdFromEdm(edm, STATUS),
    };

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
                  <FontAwesomeIcon icon={faExclamationCircle} color={OL.RED01} />
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
                    isLoading={isLoading}
                    mode="primary"
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

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addWorksitePlan,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AssignWorksiteForm);
