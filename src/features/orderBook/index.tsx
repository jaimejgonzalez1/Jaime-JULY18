import React from "react";
import "./orderbook.css";
import { Connection } from "./orderBookAPI";
import { connect } from "react-redux";
import {streamState} from '../../types/index'
import {clear,setTick,setOpen} from './orderBookSlice'
import { toast } from 'react-toastify';
import { AppDispatch } from "../../app/store";

interface IProps {
  orderbook: streamState;
  dispatch?: AppDispatch;
}

class OrderBook extends React.Component<IProps> {
  ws: Connection;
  constructor(props: IProps) {
    super(props);
    this.ws = new Connection();
    this.ws.open();
  }
  killFeed = () => {
    this.ws.close();
    this.props.dispatch && this.props.dispatch(clear())
    const val = !this.props.orderbook.open
    this.props.dispatch && this.props.dispatch(setOpen(val))
    val ? toast("Feed was Opened",{type:"success",position:'top-center'}) :toast("Feed was Killed",{type:"error",position:'top-center'});
  };
  switchFeed = () => {
    this.ws.switch();

  };
  setTick = (tick:number)=>{
    this.props.dispatch && this.props.dispatch(setTick(tick))
  }
  formatter = (num: number) => {
    const str = new Intl.NumberFormat("en-IN").format(num);
    return str;
  };
  getColor = (total: number, ask: boolean) => {
    const width = total / this.props.orderbook.size;
    const percentage = width * 100;
    const extPercentage = 100 - percentage;
    return {
      background: ask
        ? `linear-gradient(to left, rgba(255,0,0,0) ${extPercentage}%, rgba(255,0,0,0.25) ${percentage}%)`
        : `linear-gradient(to right, rgba(255,0,0,0) ${extPercentage}%, rgba(0,209,178,0.25) ${percentage}%)`,
    };
  };
  render() {
    const asks = Object.keys(this.props.orderbook.asks)
    .map((key) => this.props.orderbook.asks[key])
    .filter((k) => k);
    const bids = Object.keys(this.props.orderbook.bids)
    .map((key) => this.props.orderbook.bids[key])
    .filter((k) => k);
    return (
      <div className="contain">
        <div className="columns header p-3 has-background-black underline-1 is-mobile">
          <div className="column is-4 is-mobile has-text-left">Order Book for {this.props.orderbook.feedName} grouped by {this.props.orderbook.currentTicker}</div>
          <div className="column is-4 is-mobile has-text-centered has-text-grey is-hidden-mobile">
            Spread:{this.props.orderbook.spread.toFixed(1)}{` (${this.props.orderbook.spreadPercentage.toFixed(2)}%)`} 
          </div>
          <div className="column is-4 is-mobile has-text-right">
            <div className="dropdown is-hoverable has-text-light is-right">
              <div className="dropdown-trigger">
                <button
                  className="button is-dark"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                >
                  <span>Group {this.props.orderbook?.currentTicker} ᐯ</span>
                  <span className="icon is-small">
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </button>
              </div>
              <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content has-background-dark">
                  {this.props.orderbook?.tickerSizes.map((tick) => {
                    return (
                      // eslint-disable-next-line 
                      <a href="#" key={tick} className="dropdown-item has-text-white" onClick={() => this.setTick(tick)} >
                        Group {tick} 
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="columns body is-multiline">
          <div className="column is-6-desktop is-12-mobile">
            <div className="columns underline-2 is-mobile ">
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                TOTAL
              </div>
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                SIZE
              </div>
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                PRICE
              </div>
            </div>
            {bids.map((sub, index: number) => {
              return (
                <div
                  key={`row_${index}`}
                  className="columns is-mobile"
                  style={this.getColor(sub?.total ?? 0, false)}
                >
                  <div className="column is-4 is-mobile has-text-centered">
                      {this.formatter(sub?.total ?? 0)}
                  </div>
                  <div className="column is-4 is-mobile has-text-centered">
                    {this.formatter(sub.size)}
                  </div>
                  <div className="column is-4 is-mobile has-text-centered has-text-primary">
                    {sub.price}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="column is-6-desktop is-12-mobile is-hidden-mobile">
            <div className="columns underline-2 is-mobile is-hidden-mobile">
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                PRICE
              </div>
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                SIZE
              </div>

              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                TOTAL
              </div>
            </div>
         
            {asks?.map((sub, index: number) => {
              return (
                <div
                  key={`row_${index}`}
                  className="columns is-mobile"
                  style={this.getColor(sub?.total ?? 0, true)}
                >
                  <div className="column is-4 is-mobile has-text-centered has-text-danger">
                    {sub.price}
                  </div>
                  <div className="column is-4 is-mobile has-text-centered">
                    {sub.size}
                  </div>
                  <div className="column is-4 is-mobile has-text-centered">
                  {sub.total}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="column is-6-desktop is-12-mobile is-hidden-tablet">
            <div className="columns underline-2 is-mobile is-hidden-tablet">
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                PRICE
              </div>
              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                SIZE
              </div>

              <div className="column is-4 is-mobile has-text-centered has-text-grey">
                TOTAL
              </div>
            </div>
            <div className="columns underline-2 is-mobile is-hidden-desktop">
              <div className="column is-mobile has-text-centered has-text-grey">
                Spread:{this.props.orderbook.spread.toPrecision(1)}{` (${this.props.orderbook.spreadPercentage.toPrecision(2)}%)`}
              </div>
            </div>
            {asks?.map((sub: any, index: number) => {
              return (
                <div
                key={`row_${index}`}
                className="columns is-mobile"
                style={this.getColor(sub.total, true)}
              >
                <div className="column is-4 is-mobile has-text-centered">
                {sub.price}
                </div>
                <div className="column is-4 is-mobile has-text-centered">
                  {this.formatter(sub.size)}
                </div>
                <div className="column is-4 is-mobile has-text-centered has-text-danger ">
                  {this.formatter(sub.total)}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        <div className="columns is-flex is-justify-content-center has-background-black">
          <div className="column is-2 is-flex is-justify-content-space-around">
            <button
              className="button is-link has-text-white p-1"
              onClick={this.switchFeed}
            >
              Toggle Feed
            </button>
            <button
              className="button is-danger has-text-white p-1"
              onClick={this.killFeed}
            >
              Kill Feed
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any): IProps {
  const { orderbook } = state;
  return { orderbook };
}

export default connect<IProps, {}>(mapStateToProps)(OrderBook);
