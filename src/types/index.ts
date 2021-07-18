 export interface incomingLineItem {
    price:string;
    size:number;
    date?:number; 
    total?:number;
 }
export interface keyDateItem{
    [key: string ]:incomingLineItem
}
export interface incomingOrder{
    asks:[]
    bids:[],
    product_id:string[] | string;
    feed: string;
  }
  export interface streamState {
    bids: keyDateItem
    asks: keyDateItem;
    size: number;
    tickerSizes: number[];
    currentTicker: number;
    feedName: string;
    lastTime: number;
    spread:number;
    spreadPercentage:number;
    open: boolean
  }
  
  export interface updated{
    asks:keyDateItem,
    bids:keyDateItem,
    maxPriceSize: number,
    ticker: string;
    dateStamp:number,
    decimalPlace:number
  }
  export interface grouped{
    asks: number[][],
    bids: number[][],
    ticker: string,
    tickSize: number,
    dateStamp: number,
    decimalPlace: number,
  }
  export interface ITickerOptions{
    [key: string]: {
        tickSizes: number[]
    }
  }

