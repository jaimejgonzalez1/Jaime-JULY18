import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import calculate from './calculation'


describe("Orderbook Computation", () => {
  test("it creates spread", () => {
    expect(calculate.calcSpread({},{})).toEqual({ value: 0 , percentage: 0 });
  });
})