import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { AccountSliceReducer } from 'zkwasm-minirollup-browser';
import stateReducer from "../data/state";
import uiReducer from "../data/ui";
export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['acccount/deriveL2Account/fulfilled'],
        ignoredActionPaths: ['payload.web3','payload.seed', 'payload.injector', 'meta.arg.cmd'],
        ignoredPaths: [
          "acccount/fetchAccount/fulfilled",
          "account.l1Account.web3",
          "extra.rounds",
          "endpoint.zkWasmServiceHelper",
          "account.l2account"
        ],
      },
    }),
  reducer: {
    account: AccountSliceReducer,
    state: stateReducer,
    extra: uiReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
