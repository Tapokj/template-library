import React from 'react';

import { CSSTransition } from 'react-transition-group';
import { ErrorT } from './interfaces';

// assets
// import './Error.scss';

export const DisplayError = ({
  children,
  touched,
  touchedControl,
  classNameError,
  timeout,
  isHideOnSelect,
}: ErrorT) => {
  if (!touchedControl) {
    return (
      <div className={`display-error-component ${classNameError}`}>
        <p>{children}</p>
      </div>
    );
  }

  if (touchedControl) {
    return (
      <div
        className={
          isHideOnSelect
            ? 'display-error-component'
            : 'display-error-component not-hidden'
        }
      >
        <CSSTransition
          unmountOnExit
          timeout={timeout}
          classNames="touched"
          in={touched}
        >
          <p className={classNameError}>{children}</p>
        </CSSTransition>
      </div>
    );
  }

  return null;
};

const defaultProps: ErrorT = {
  touchedControl: false,
  touched: false,
  timeout: 300,
  isHideOnSelect: true,
  classNameError: '',
};

DisplayError.defaultProps = defaultProps;
