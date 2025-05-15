import { RootState } from "../app/store";
import { createStateSlice, PropertiesState, ConnectState } from "zkwasm-minirollup-browser";

export interface PlayerInfo {
  nonce: number;
  data: {
      balance: number;
      round: number;
      rounds: number[];
      purchase: number[]
  };
}

export interface GlobalState {
    round: number;
    counter: number;
    pool: number;
    cards: number[];
}

export interface Bid {
  bidprice: number;
}

export interface Nugget {
  id: number;
  attributes: string;
  feature: number;
  cycle: number;
  sysprice: number;
  askprice: number;
  bid: Bid | null;
}

const initialState: PropertiesState<PlayerInfo, GlobalState, any> = {
    connectState: ConnectState.Init,
    isConnected: false,
    userState: null,
    lastError: null,
    config: null,
};

export const propertiesSlice = createStateSlice(initialState);

export const selectConnectState = (state: RootState) => state.state.connectState;
export const selectUserState = (state: RootState) => state.state.userState;
export const selectLastError = (state: RootState) => state.state.lastError;

export const { setLastTransactionError, setConnectState } = propertiesSlice.actions;
export default propertiesSlice.reducer;
