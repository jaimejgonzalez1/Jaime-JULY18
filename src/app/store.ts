import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import orderBookSlice from '../features/orderBook/orderBookSlice';

const store = configureStore({
  reducer: {
    orderbook: orderBookSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
}),
});

export default store

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
