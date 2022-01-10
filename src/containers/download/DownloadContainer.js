// @flow
import React from 'react';

import { Button, CardStack } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import { downloadEnrollments, downloadWorksites } from './actions';

const DownloadContainer = () => {
  const dispatch = useDispatch();

  return (
    <CardStack>
      <Button color="primary" onClick={() => dispatch(downloadEnrollments())}>Download Enrollments, etc.</Button>
      <Button onClick={() => dispatch(downloadWorksites())}>Download Worksites</Button>
    </CardStack>
  );
};

export default DownloadContainer;
