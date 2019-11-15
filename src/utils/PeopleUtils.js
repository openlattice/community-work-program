// @flow
import React from 'react';
import toString from 'lodash/toString';
import { Map } from 'immutable';
import { faUser, faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Element } from 'react';

import { PersonPhoto, PersonPicture, StyledPersonPhoto } from '../components/picture/PersonPicture';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';
import { isDefined } from './LangUtils';
import { getEntityProperties } from './DataUtils';
import { getImageDataFromEntity } from './BinaryUtils';

const {
  FIRST_NAME,
  LAST_NAME,
  MUGSHOT,
  PICTURE,
} = PROPERTY_TYPE_FQNS;

const getPersonFullName = (personEntity :Map) :string => {

  let fullName :string = EMPTY_FIELD;
  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(personEntity, [FIRST_NAME, LAST_NAME]);
  if (!isDefined(firstName) || !isDefined(lastName)) return fullName;

  fullName = `${firstName} ${lastName}`;
  return fullName;
};

const getPersonProfilePicture = (person :Map, image :Map) :Element<*> => {

  const defaultIcon :Element<any> = <FontAwesomeIcon icon={faUser} size="6x" color="#D8D8D8" />;

  const { [MUGSHOT]: mugshot } = getEntityProperties(person, [MUGSHOT]);
  if (isDefined(mugshot) && mugshot.length) {
    return (
      <PersonPhoto>
        <PersonPicture src={mugshot} />
      </PersonPhoto>
    );
  }
  if (isDefined(image) && !image.isEmpty()) {
    const imageURL = getImageDataFromEntity(image);
    return (
      <PersonPhoto>
        <PersonPicture src={imageURL} />
      </PersonPhoto>
    );
  }

  return defaultIcon;
};

const getPersonPictureForTable = (person :Map, small :boolean) :Element<*> => {

  const { [MUGSHOT]: mugshot, [PICTURE]: picture } = getEntityProperties(person, [MUGSHOT, PICTURE]);
  const photo :string = mugshot || picture;

  if (photo) {
    return (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    );
  }
  return (
    <FontAwesomeIcon icon={faUserCircle} color="#D8D8D8" size="2x" />
  );
};

const getHoursServed = (hoursWorked :number, hoursRequired :number) :string => {

  if (!hoursWorked && !hoursRequired) return EMPTY_FIELD;
  if (!isDefined(hoursWorked) || !isDefined(hoursRequired)) return EMPTY_FIELD;
  if (hoursRequired === 0) return EMPTY_FIELD;
  return `${toString(hoursWorked)} / ${toString(hoursRequired)}`;
};

export {
  getHoursServed,
  getPersonFullName,
  getPersonPictureForTable,
  getPersonProfilePicture,
};
