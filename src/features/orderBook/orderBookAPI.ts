import {read} from './orderBookSlice'
import store from '../../app/store'

const endpoint = "wss://www.cryptofacilities.com/ws/v1";
const subscribe = {
  event: "subscribe",
  feed: "book_ui_1",
  product_ids: ["PI_XBTUSD"],
} 
const subscribe2 ={
  event: "subscribe",
  feed: "book_ui_1",
  product_ids: ["PI_ETHUSD"],
} 

const channel1 = 'PI_XBTUSD'
const channel2 = 'PI_ETHUSD'

export class Connection {
  feed:WebSocket | null;
  currentChannel: string | null;
  openConnect:boolean;
  constructor(){
    this.feed = null
    this.currentChannel = channel1
    this.openConnect = false;
  }
  open( message = subscribe,end = endpoint){
    const feed = new WebSocket(end);
    this.feed = feed
    feed.onopen = () => {
      this.openConnect = true
      feed.send(JSON.stringify(message));
    };

    feed.onmessage = (event: MessageEvent) => {
      if(this.openConnect){
        store.dispatch(read(event))
      }
    
    };
    feed.onclose = () => {
        this.openConnect = false
    }

  
  }
  close(){
    this.openConnect? this.feed?.close() : this.open()
  }
  switch() {
    const oldChannel = this.currentChannel;
    this.currentChannel = this.currentChannel !== channel1 ? channel1 : channel2;
    const newChannel = oldChannel === channel1 ? subscribe2 : subscribe
    const unsubscribe = {event:"unsubscribe",feed:"book_ui_1",product_ids:[oldChannel]}
    this.feed?.send(JSON.stringify(unsubscribe))
    this.open(newChannel);
  }
}

