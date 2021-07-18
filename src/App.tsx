import './App.css';
import OrderBook from './features/orderBook'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <div className="App">
      <OrderBook></OrderBook>
      <ToastContainer/>
    </div>
  );
}

export default App;
