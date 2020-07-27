import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import _isEqual from 'lodash/isEqual';

declare module 'axios' {
  interface AxiosResponse<T = any> extends Promise<T> {}
  interface AxiosError<T = any> extends Promise<T> {}
}

interface RefreshTokenConfig {
  isBearer: boolean;
  isTokenRefresh: boolean;
  userTokenName: string;
  refreshTokenName: string;
  endpointRefresh: string;
  useCustomTokenService: boolean;
  onRefreshTokenFailure: Function;
  onRefreshTokenSuccess: Function;
}

const REFRESH_INITIAL: RefreshTokenConfig = {
  isBearer: false,
  isTokenRefresh: false,
  userTokenName: 'user_token',
  refreshTokenName: 'refresh_token',
  endpointRefresh: '/user/refresh-token',
  useCustomTokenService: true,
  onRefreshTokenFailure: () => null,
  onRefreshTokenSuccess: () => null,
};

class AxiosConfig {
  protected readonly api: AxiosInstance;
  private subscribers: Array<any> = [];
  private isAlreadyFetchedToken: boolean = false;

  public constructor(
    protected url: string,
    protected refreshConfig: RefreshTokenConfig = REFRESH_INITIAL
  ) {
    this.api = this._create(url);

    this._initializeResponseInterceptor(refreshConfig);
    this._initializeRequestInterceptor(refreshConfig);
  }

  _create = (url: string) => {
    return axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  private _initializeResponseInterceptor = (config: RefreshTokenConfig) => {
    this.api.interceptors.response.use(this._handleResponse, error =>
      this._handleError(error, config)
    );
  };

  private _initializeRequestInterceptor = (_config: RefreshTokenConfig) => {
    const bearerName = _config.isBearer ? 'bearer' : 'bearer_token';

    return this.api.interceptors.request.use(options => {
      const token = localStorage.getItem(_config.userTokenName);
      const bearers = { bearer: token, bearer_token: `Bearer ${token}` }[
        bearerName
      ];

      options.headers.Authorization = bearers;
      return options;
    });
  };

  _resetToken = async (error: any, _config: RefreshTokenConfig) => {
    const { response: errorResponse } = error;

    const refresh_token: any = localStorage.getItem(_config.refreshTokenName);

    if (!refresh_token) {
      _config.onRefreshTokenFailure();
      return (window.location.href = '/');
    }

    const { refreshToken, email } = JSON.parse(refresh_token);

    const token = refreshToken;

    if (!token) {
      // We can't refresh, throw the error anyway
      return Promise.reject(error);
    }

    /* Proceed to the token refresh procedure
      We create a new Promise that will retry the request,
      clone all the request configuration from the failed
      request in the error object. */

    const retryOriginalRequest = new Promise(resolve => {
      /* We need to add the request retry to the queue
      since there another request that already attempt to
      refresh the token */

      this.addSubsriber((access_token: string) => {
        errorResponse.config.headers.Authorization = access_token;
        resolve(axios(errorResponse.config));
      });
    });

    if (!this.isAlreadyFetchedToken) {
      const refreshData = {
        refreshToken: token,
        email,
      };

      const response = await this.api.post(
        _config.endpointRefresh,
        refreshData
      );

      if (!response.data) {
        return Promise.reject(error);
      }

      this.isAlreadyFetchedToken = true;
      const { token: responseToken } = response.data;
      this._onRefreshSuccess(_config, responseToken);
      this.onAccessTokenFetched(`Bearer ${responseToken}`);
    }

    return retryOriginalRequest;
  };

  // Response/Error Handlers

  protected _handleError = (error: AxiosError, config: RefreshTokenConfig) => {
    // handle token refresh

    const handleTokenRefresh = () => {
      if (error.response) {
        return _isEqual(error.response.status, 401)
          ? this._resetToken(error, config)
          : Promise.reject(error);
      }

      return;
    };

    return config.isTokenRefresh ? handleTokenRefresh() : Promise.reject(error);
  };

  private _handleResponse = (response: AxiosResponse) => response;

  // Subscribers

  private onAccessTokenFetched = (access_token: string) => {
    // When the refresh is successful, we start retrying the requests one by one and empty the queue
    this.subscribers.forEach(callback => callback(access_token));
    this.subscribers = [];
  };

  private addSubsriber = (callback: Function) =>
    this.subscribers.push(callback);

  private _onRefreshSuccess = (_config: RefreshTokenConfig, token: string) => {
    if (_config.useCustomTokenService) {
      localStorage.setItem(_config.userTokenName, token);
    }

    return (token: string) => _config.onRefreshTokenSuccess(token);
  };
}

// API Facade Interface

export class Api {
  protected http: AxiosConfig;
  private api: AxiosInstance;

  constructor(protected url: string, protected config: AxiosConfig) {
    this.http = config;
    this.api = config._create(url);
  }

  // get request
  get = (url: string) => this.api.get(url);

  // post request
  post = (url: string, data: object) => this.api.post(url, data);

  // put request
  update = (url: string, data: object = {}) => this.api.put(url, data);

  // delete request
  delete = (url: string, data: object = {}) => this.api.delete(url, data);
}

export const Http = (
  endpointName: string,
  refreshConfig: RefreshTokenConfig
) => {
  const _config = new AxiosConfig(endpointName, refreshConfig);
  return new Api(endpointName, _config);
};
