import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequestError, rpc } from 'zkwasm-minirollup-browser';
import { LeHexBN, query } from 'zkwasm-minirollup-rpc';
import { RootState } from '../app/store';
import { Nugget } from './state';

import { enableMapSet } from 'immer';

// enable Map and Set support in Immer
enableMapSet();
async function queryData(url: string) {
  try {
    const data: any = await rpc.queryData(url)
    return data.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 500) {
        throw new Error("QueryStateError");
      } else {
        throw new Error("UnknownError");
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      throw new Error("No response was received from the server, please check your network connection.");
    } else {
      throw new Error("UnknownError");
    }
  }
}

async function queryRound(index: number) {
  let data = await queryData(`round/${index}`);
  return  {
      round: index,
      info: data[0],
  }
}

export const getRound = createAsyncThunk(
  'client/getRound',
  async (page: number, { rejectWithValue }) => {
    try {
      const res: any = await queryRound(page);
      return res;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
)

export enum ModalIndicator {
  NONE,
  WITHDRAW,
  DEPOSIT,
  RESPONSE,
}

interface UIState {
  modal: null | ModalIndicator;
}

export interface RoundResult {
  winner: bigint,
  pool: bigint,
  total: bigint
}

export interface PropertiesState {
    rounds: Map<number, RoundResult>;
    uiState: UIState;
    lastError: RequestError | null,
    lastResponse: string | null,
}

const initialState: PropertiesState = {
  rounds: new Map(),
  lastError: null,
  lastResponse: null,
  uiState: {
    modal: null,
  }
}

const uiSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setUIState: (state, d: PayloadAction<UIState>) => {
      state.uiState = d.payload;
    },
    setUIResponse: (state, d: PayloadAction<string>) => {
      state.lastResponse = d.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getRound.fulfilled, (state, action) => {
        const round = action.payload;
        state.rounds.set(round.round, round.info);
      })
      .addCase(getRound.rejected, (state, action) => {
        state.lastError = {
          errorInfo:`send transaction rejected: ${action.payload}`,
          payload: action.payload,
        }
      })
  }
});

export const selectUIState = (state: RootState) => state.extra.uiState;
export const selectRounds = (state: RootState) => state.extra.rounds;
export const selectUIResponse = (state: RootState) => state.extra.lastResponse;
export const { setUIState, setUIResponse } = uiSlice.actions;
export default uiSlice.reducer;
