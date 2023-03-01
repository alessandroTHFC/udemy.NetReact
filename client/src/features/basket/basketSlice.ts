import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Basket } from "../../app/models/basket";

interface BasketState {
  basket: Basket | null;
  status: string;
}

const initialState: BasketState = {
  basket: null,
  status: "idle",
};

// These createAsyncThunk functions will centralise our API calls to within our slices instead of having them inside our components
// Good description of createAsyncThunk https://javascript.plainenglish.io/createasyncthunk-in-redux-toolkit-4d8d2f0412d3
export const addBasketItemsAsync = createAsyncThunk<
  Basket,
  { productId: number; quantity?: number }
>(
  "basket/addItemBasketAsync",
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      return await agent.Basket.addItem(productId, quantity);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

// removeItem doesnt return anything so<void>
export const removeBasketItemAsync = createAsyncThunk<
  void,
  { productId: number; quantity: number; name?: string }
>("basket/removeBasketItemAsync", async ({ productId, quantity }, thunkAPI) => {
  try {
    await agent.Basket.removeItem(productId, quantity);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

//(createSlice) A function that accepts an initial state, an object of reducer functions, and a "slice name",
// and automatically generates action creators and action types that correspond to the reducers and state.
// This API is the standard approach for writing Redux logic.

export const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    setBasket: (state, action) => {
      state.basket = action.payload;
    },
  },

  //   Extra reducers handle asynchronous requests
  //   For each action that is created using createAsyncThunk,
  // there are three probable state for the promise returned. pending, fulfilled, rejected.
  extraReducers: (builder) => {
    builder.addCase(addBasketItemsAsync.pending, (state, action) => {
      // this status is appending the metadata productID which will distinguish which item is being added
      // because of this the loading spinner will be isolated to that specific product instead of showing
      // on all products
      state.status = "pendingAddItem" + action.meta.arg.productId;
    });
    builder.addCase(addBasketItemsAsync.fulfilled, (state, action) => {
      state.basket = action.payload;
      state.status = "idle";
    });
    builder.addCase(addBasketItemsAsync.rejected, (state, action) => {
      state.status = "idle";
      console.log(action.payload);
    });
    builder.addCase(removeBasketItemAsync.pending, (state, action) => {
      state.status =
        "pendingRemoveItem" + action.meta.arg.productId + action.meta.arg.name;
    });
    builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
      const { productId, quantity } = action.meta.arg;
      const itemIndex = state.basket?.items.findIndex(
        (i) => i.productId === productId
      );
      if (itemIndex === -1 || itemIndex === undefined) return;
      state.basket!.items[itemIndex].quantity -= quantity;
      if (state.basket?.items[itemIndex].quantity === 0)
        state.basket.items.splice(itemIndex, 1);
      state.status = "idle";
    });
    builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
      state.status = "idle";
      console.log(action.payload);
    });
  },
});

export const { setBasket } = basketSlice.actions;
