import React, { HTMLAttributes, ReactChild } from 'react';

import { Form, Field } from './Form';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactChild;
}

export const AppExample = () => {
  return (
    <Form
      isLoader={false}
      isLoading={false}
      onSubmit={data => console.log('submit', data)}
      initialValues={{ email: '' }}
    >
      <Field name="email" />
    </Form>
  );
};

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: hps://github.com/storybookjs/storybook/issues/9556tt
export const Thing = () => {
  return <AppExample />;
};
