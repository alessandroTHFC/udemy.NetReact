import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { basketSlice } from "../../features/basket/basketSlice";
import { catalogSlice } from "../../features/catalog/catalogSlice";
import { counterSlice } from "../../features/contact/counterSlice";

// export function configureStore() {
//   return createStore(counterReducer);
// }

//* Specify which reducers we want available to our store
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    basket: basketSlice.reducer,
    catalog: catalogSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//* custom hooks to specify return types? so dont have to specify inside the application code?
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
