// @flow
import { List, Map } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { ALL, FILTERS } from '../ParticipantsConstants';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES_MAP, ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';

const { STATUS } = PROPERTY_TYPE_FQNS;

const formatClickedProperty = (clickedProperty :Object) :string => {
  const property = clickedProperty.label.toUpperCase().split(' ');
  property.splice(2, 1);
  return (
    property.join(' ').replace(' ', '_').replace('-', '')
  );
};

const filterPeopleByProperty = (
  people :List,
  property :string,
  propertyMap :Map,
  filterMap :Object
) :List => {

  if (property === ALL) {
    return people;
  }

  return people.filter((person :Map) => {
    const filterTypeToInclude = filterMap[property];
    const personEKID :UUID = getEntityKeyId(person);
    const entityOrValueFound :Map | string = propertyMap.get(personEKID, Map());
    let value = entityOrValueFound;

    if (Map.isMap(entityOrValueFound)) {
      let { [STATUS]: status } = getEntityProperties(entityOrValueFound, [STATUS]);
      status = !isDefined(status) ? ENROLLMENT_STATUSES.AWAITING_CHECKIN : status;
      value = status;
    }
    return value === filterTypeToInclude;
  });
};

const getFilteredPeople = (
  filter :string,
  clickedProperty :Object,
  peopleList :List,
  courtTypeFilterValue :Object,
  statusFilterValue :Object,
  courtTypeByParticipant :Map,
  enrollmentByParticipant :Map
) => {

  const property :string = formatClickedProperty(clickedProperty);

  let filteredPeople :List = List();
  const newState :Object = {};

  if (filter === FILTERS.STATUS) {
    newState.statusFilterValue = clickedProperty;
    const currentCourtTypeProperty :string = formatClickedProperty(courtTypeFilterValue);
    const peopleListFilteredByCourtType :List = filterPeopleByProperty(
      peopleList,
      currentCourtTypeProperty,
      courtTypeByParticipant,
      COURT_TYPES_MAP
    );

    if (property === ALL) {
      if (currentCourtTypeProperty === ALL) {
        newState.peopleToRender = peopleList;
        return { filteredPeople: peopleList, newState };
      }
      // if status === ALL && court type !== ALL, just filter participants list by court type:
      newState.peopleToRender = peopleListFilteredByCourtType;
      return { filteredPeople: peopleListFilteredByCourtType, newState };
    }
    // if status !== ALL, we need to filter by 1) currently selected court type filter and 2) new status filter:
    filteredPeople = peopleListFilteredByCourtType;
    filteredPeople = filterPeopleByProperty(filteredPeople, property, enrollmentByParticipant, ENROLLMENT_STATUSES);
    newState.peopleToRender = filteredPeople;
  }

  if (filter === FILTERS.COURT_TYPE) {
    newState.courtTypeFilterValue = clickedProperty;
    const currentStatusProperty :string = formatClickedProperty(statusFilterValue);
    const peopleListFilteredByStatus :List = filterPeopleByProperty(
      peopleList,
      currentStatusProperty,
      enrollmentByParticipant,
      ENROLLMENT_STATUSES
    );

    if (property === ALL) {
      if (currentStatusProperty === ALL) {
        newState.peopleToRender = peopleList;
        return { filteredPeople: peopleList, newState };
      }
      // if court type === ALL && status !== ALL, just filter participants list by status:
      newState.peopleToRender = peopleListFilteredByStatus;
      return { filteredPeople: peopleListFilteredByStatus, newState };
    }
    // if court type !== ALL, we need to filter by 1) currently selected status filter and 2) new court type filter:
    filteredPeople = peopleListFilteredByStatus;
    filteredPeople = filterPeopleByProperty(filteredPeople, property, courtTypeByParticipant, COURT_TYPES_MAP);
    newState.peopleToRender = filteredPeople;
  }

  return { filteredPeople, newState };
};

export {
  filterPeopleByProperty,
  formatClickedProperty,
  getFilteredPeople,
};
