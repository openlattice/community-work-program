// @flow
import React from 'react';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { PersonPhoto, PersonPicture } from '../components/picture/PersonPicture';
import { PEOPLE_FQNS } from '../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';
import { isDefined } from './LangUtils';
import { getEntityProperties } from './DataUtils';
import { getImageDataFromEntity } from './BinaryUtils';

const { FIRST_NAME, LAST_NAME, MUGSHOT } = PEOPLE_FQNS;

const getPersonFullName = (personEntity :Map) :string => {

  let fullName :string = EMPTY_FIELD;
  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(personEntity, [FIRST_NAME, LAST_NAME]);
  if (!isDefined(firstName) || !isDefined(lastName)) return fullName;

  fullName = `${firstName} ${lastName}`;
  return fullName;
};

const getPersonProfilePicture = (person :Map, image :Map) => {

  const defaultIcon :React.Element = <FontAwesomeIcon icon={faUser} size="6x" color="#D8D8D8" />;

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

export {
  getPersonFullName,
  getPersonProfilePicture,
};
