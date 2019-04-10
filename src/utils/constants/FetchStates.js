/*
 * @flow
 */

type FetchStateEnum = {|
  PRE_FETCH :0;
  IS_FETCHING :1;
  FETCH_SUCCESS :2;
  FETCH_FAILURE :3;
|};
type FetchState = $Values<FetchStateEnum>;

// TODO: look into using Immutable.Map() or other possible "enum" libraries
const FetchStates :FetchStateEnum = Object.freeze({
  PRE_FETCH: 0,
  IS_FETCHING: 1,
  FETCH_SUCCESS: 2,
  FETCH_FAILURE: 3,
});

export default FetchStates;
export type {
  FetchState,
  FetchStateEnum,
};
