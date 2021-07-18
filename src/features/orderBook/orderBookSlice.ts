import { createSlice, current } from "@reduxjs/toolkit";
import {streamState, ITickerOptions, incomingOrder} from '../../types/index'
import compute from './calculation'

const tickerOptions: ITickerOptions = {
    PI_XBTUSD: {
      tickSizes:[0.5, 1, 2.5]
    },
    PI_ETHUSD: {
      tickSizes:[0.05,0.1, 0.25]
    },
  };

const initialState: streamState = {
  bids: {},
  asks: {},
  size: 0,
  tickerSizes: tickerOptions["PI_XBTUSD"].tickSizes,
  currentTicker: tickerOptions["PI_XBTUSD"].tickSizes[0],
  feedName: "PI_XBTUSD",
  lastTime: new Date().getTime(),
  spread: 0,
  spreadPercentage: 0,
  open: true

};

export const orderbookSlice = createSlice({
  name: "orderbook",
  initialState,
  reducers: {
    read: (state, record) => {
      const curr = current(state)
      const data:incomingOrder = JSON.parse(record.payload.data);
      if(curr.open){
        if (data.feed=== "book_ui_1_snapshot") {
          const maxPrice = data.asks
            .concat(data.bids)
            .filter((d) => d[1])
            .map((d) => d[1])
            .reduce((acc, curr) => acc + curr, 0);
          state.size = maxPrice;
          const decimal = compute.getDecimal(state.currentTicker)
          const date = new Date().getTime()
          const mappedBids = compute.mapIncomingToObject(data.bids,date,decimal)
          const mappedAsks = compute.mapIncomingToObject(data.asks,date,decimal)
          state.feedName = Array.isArray(data.product_id) ?  data.product_id[0] : data.product_id
          state.bids = compute.groupRows(state.currentTicker, mappedBids ) 
          state.asks = compute.groupRows(state.currentTicker, mappedAsks)
          state.lastTime = new Date().getTime()
          const spread = compute.calcSpread(state.asks,state.bids)
          state.spread = spread.value
          state.spreadPercentage = spread.percentage
          state.tickerSizes = tickerOptions[Array.isArray(data.product_id) ?  data.product_id[0] : data.product_id].tickSizes
          state.currentTicker = state.tickerSizes[0]
  
        }else if(data.feed=== "book_ui_1"){
          const update = compute.update(data,curr)
          if(update){
            state.asks = update.asks
            state.bids = update.bids
            state.feedName = update.ticker 
            state.size = update.maxPriceSize
            const spread = compute.calcSpread(state.asks,state.bids)
            state.spread = spread.value
            state.spreadPercentage = spread.percentage
            state.lastTime = update.dateStamp
          }
        }
      }
     
    },
    clear: (state) => {
      state.asks = {};
      state.bids = {};
    },
    setTick: (state,tick) => {
        state.currentTicker = tick.payload
    },
    setOpen: (state, option) =>{
      state.open = option.payload
    }
  },
});

export const { read, clear, setTick,setOpen } = orderbookSlice.actions;

export default orderbookSlice.reducer;



