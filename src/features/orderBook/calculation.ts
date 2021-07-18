import {
  incomingOrder,
  incomingLineItem,
  grouped,
  streamState,
  keyDateItem,
} from "../../types";
const freq = 2000;
class CalcLibrary {
  roundDecimals = (input: number, tickSize: number, decimalPlace: number) => {
    if (decimalPlace === 0) return Math.floor(input);
    const roundToTickerSize =
      Math.floor(input * Math.pow(10, decimalPlace)) /
      Math.pow(10, decimalPlace);
    return parseFloat(
      (
        Math.floor(parseFloat((roundToTickerSize / tickSize).toFixed(10))) *
        tickSize
      ).toFixed(decimalPlace)
    );
  };
  mapIncomingToObject = (
    incoming: number[][],
    dateStamp: number,
    decimalPlace: number
  ) => {
    const incomingMap = incoming.reduce(
      (acc: { [key: number]: incomingLineItem }, curr) => {
        const [price, size] = curr;
        acc[price] = {
          price: price.toFixed(decimalPlace),
          size: size,
          date: dateStamp,
        };
        return acc;
      },
      {}
    );
    return incomingMap;
  };
  getDecimal = (tickSize: number) => {
    return Number.isInteger(tickSize)
      ? 0
      : tickSize.toString().split(".")[1]?.length || 0;
  };

  groupRows = (
    tickSize: number,
    orders: { [key: number]: incomingLineItem }
  ) => {
    const decimalPlace = this.getDecimal(tickSize);
    let total = 0;
    return Object.entries(orders)
      .sort((a, b) => {
        return parseFloat(a[1].price) - parseFloat(b[1].price);
      })
      .filter((k) => k)
      .map((order) => {
        const { price, size } = order[1];
        total += size;
        return {
          price: this.roundDecimals(
            parseFloat(price),
            tickSize,
            decimalPlace
          ).toFixed(decimalPlace),
          size,
          total,
        };
      })
      .reduce((acc, curr) => {
        return {
          ...acc,
          [curr.price]: curr,
        };
      }, {});
  };

  groupToOrderbook = ({
    bids,
    asks,
    ticker,
    tickSize,
    dateStamp,
    decimalPlace,
  }: grouped) => {
    const max = asks
      .concat(bids)
      .filter((d) => d[1])
      .map((d) => d[1])
      .reduce((acc, curr) => acc + curr, 0);
    let _asks = this.groupRows(
      tickSize,
      this.mapIncomingToObject(asks, dateStamp, decimalPlace)
    );
    let _bids = this.groupRows(
      tickSize,
      this.mapIncomingToObject(bids, dateStamp, decimalPlace)
    );
    return {
      dateStamp,
      ticker,
      asks: _asks,
      bids: _bids,
      maxPriceSize: max,
    };
  };
  calcSpread(asks: keyDateItem, bids: keyDateItem) {
    if (!asks || !bids) return { value: 0, percentage: 0 };
    let { [Object.keys(bids).pop() as string]: lastBid } = bids ?? 0;
    let ask =
      (asks[Object.keys(asks)[0]] &&
        parseFloat(asks[Object.keys(asks)[0]].price)) ??
      0;
    let bid = parseFloat(lastBid.price);
    let mid = bid + ask;
    let result = ((ask - bid) / mid) * 100;
    return { value: ask - bid, percentage: result };
  }
  update(incomingOrder: incomingOrder, currOrderBook: streamState) {
    if (!incomingOrder.asks || !incomingOrder.bids) return;
    let asks = Object.assign({}, currOrderBook.asks);
    let bids = Object.assign({}, currOrderBook.bids);
    const product_id = currOrderBook.feedName;
    const lastAnnouncedTime = currOrderBook.lastTime;
    const tickSize = currOrderBook.currentTicker;
    const currentDateStamp = new Date().getTime();

    const decimalPlace = this.getDecimal(tickSize);
    incomingOrder.asks?.forEach((incoming: number[]) => {
      const [price, size] = incoming;
      const prevPrice = asks[price];
      if (!prevPrice && size) {
        asks[price] = {
          price: price.toFixed(decimalPlace),
          size,
          date: currentDateStamp,
        };
      }
      if (prevPrice?.date && prevPrice.date < currentDateStamp) {
        if (size === 0) {
          delete asks[price];
        } else {
          asks[price] = {
            price: price.toFixed(decimalPlace),
            size,
            date: currentDateStamp,
          };
        }
      }
    });

    incomingOrder.bids?.forEach((incoming: number[]) => {
      const [price, size] = incoming;
      const prevPrice = bids[price];
      if (!prevPrice && size) {
        bids[price] = {
          price: price.toFixed(decimalPlace),
          size,
          date: currentDateStamp,
        };
      }
      if (prevPrice?.date && prevPrice.date < currentDateStamp) {
        if (size === 0) {
          delete bids[price];
        } else {
          bids[price] = {
            price: price.toFixed(decimalPlace),
            size,
            date: currentDateStamp,
          };
        }
      }
    });
    const _asks = Object.keys(asks).map((key) => {
      const { price, size } = asks[key];
      return [parseFloat(price), size];
    });
    const _bids = Object.keys(bids).map((key) => {
      const { price, size } = bids[key];
      return [parseFloat(price), size];
    });
    const allowedNextAnnoucement = new Date(lastAnnouncedTime + freq).getTime();
    if (currentDateStamp > allowedNextAnnoucement) {
      return this.groupToOrderbook({
        asks: _asks,
        bids: _bids,
        ticker: product_id,
        tickSize: tickSize,
        dateStamp: currentDateStamp,
        decimalPlace: decimalPlace,
      });
    }
  }
}

export default new CalcLibrary();
