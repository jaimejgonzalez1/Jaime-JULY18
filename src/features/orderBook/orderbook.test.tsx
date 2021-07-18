import calculate from "./calculation";

describe("Orderbook Computation", () => {
  test("it creates spread", () => {
    const item1 = { 100: { price: "100", size: 10, date: 10, total: 10 } };
    const item2 = { 100: { price: "100", size: 10, date: 10, total: 10 } };
    expect(calculate.calcSpread(item1, item2)).toEqual({
      value: 0,
      percentage: 0,
    });
  });
  test("it maps to object", () => {
    expect(calculate.mapIncomingToObject([[10, 10]], 100, 1)).toEqual({
      "10": {
        date: 100,
        price: "10.0",
        size: 10,
      },
    });
  });
  test("it gets decimal length", () => {
    expect(calculate.getDecimal(10.01)).toBe(2);
  });
  test("it groups rows by ticksize", () => {
    expect(
      calculate.groupRows(0.1, {
        "10": {
          date: 100,
          price: "10.0",
          size: 10,
        },
      })
    ).toStrictEqual({ "10.0": { price: "10.0", size: 10, total: 10 } });
  });
  test("it gets updated orderbook", () => {
    expect(
      calculate.update(
        { asks: [], bids: [], product_id: "test",feed:'test' },
        {
          bids: {},
          asks: {},
          size: 1,
          tickerSizes: [],
          currentTicker: 0,
          feedName: "test",
          lastTime: 1000,
          spread: 10,
          spreadPercentage: 10,
          open: true,
        }
      )
    ).toStrictEqual({
      asks: {},
      bids: {},
      dateStamp: new Date().getTime(),
      maxPriceSize: 0,
      ticker: "test",
    });
  });
  test("it gets grouped Orderbook", () => {
    expect(
      calculate.groupToOrderbook({
        bids: [],
        asks: [],
        tickSize: 0.5,
        ticker: "",
        dateStamp: 100,
        decimalPlace: 2,
      })
    ).toStrictEqual({
      asks: {},
      bids: {},
      dateStamp: 100,
      maxPriceSize: 0,
      ticker: "",
    });
  });
});
