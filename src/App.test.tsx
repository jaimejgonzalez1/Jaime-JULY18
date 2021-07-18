import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import  store  from './app/store';
import App from './App';
describe("The overall app ", () =>{
  test('renders app', () => {
    const rendered = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(rendered).toBeTruthy();
});

})
