import _cloneDeep from 'lodash/cloneDeep';
import { call, put } from 'redux-saga/effects';
import _get from 'lodash/get';

import { AxiosResponse, AxiosError } from 'axios';

type StatusT = {
  REQUEST: string;
  SUCCESS: string;
  FAILURE: string;
};

export const STATUS: StatusT = {
  REQUEST: 'REQUEST',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

interface actionAcT {
  request: Function;
  success: Function;
  failure: Function;
}

export const action = (type: string, payload: object = {}) => ({
  type,
  payload: _cloneDeep(payload),
});

// request type function

export const createRequestTypes = (base: string) => {
  const accT: { [key: string]: string } = {};

  return [STATUS.REQUEST, STATUS.SUCCESS, STATUS.FAILURE].reduce(
    (acc: typeof accT, type) => {
      acc[type] = `${base}_${type}`;
      return acc;
    },
    {}
  );
};

// create action creator

export const createActionAc = (type: typeof typeT): actionAcT => {
  const typeT: { [key: string]: string } = {};
  return {
    request: () => action(type[STATUS.REQUEST]),
    success: (response: AxiosResponse) =>
      action(type[STATUS.SUCCESS], response),
    failure: (error: AxiosError) => action(type[STATUS.FAILURE], error),
  };
};

// basic universal saga with data fetching

export function* fetchEntity(entity: actionAcT, apiFn: any, data = {}) {
  //   yield put(startLoading());
  yield put(entity.request());
  try {
    const response = yield call(apiFn, data);
    yield put(entity.success(_get(response, 'data')));
    // yield put(finishLoading());
  } catch (error) {
    const systError = error.response
      ? error.response.data
      : { message: 'Unexpected error' };
    yield put(entity.failure(systError));
    // yield put(requestError(systError));
  }
}
