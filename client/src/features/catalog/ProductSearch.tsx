import { debounce, TextField } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { setProductParams } from "./catalogSlice";

function ProductSearch() {
  const { productParams } = useAppSelector((state) => state.catalog);
  const [searchTerm, setSearchTerm] = useState(productParams.searchTerm);
  const dispatch = useAppDispatch();

  //* Function used to delay the dispatch of action to redux store. Without this, when a letter is typed
  //* into the search field it will immediately make the request, letter by letter instead of waiting for a complete word
  const debouncedSearch = debounce((event: any) => {
    dispatch(setProductParams({ searchTerm: event.target.value }));
  }, 1000);

  return (
    <TextField
      label="Search Products"
      variant="outlined"
      fullWidth
      value={searchTerm || ""}
      onChange={(event: any) => {
        setSearchTerm(event.target.value);
        debouncedSearch(event);
      }}
      //* COMMENT: When we dispatch the above action we will set our product params inside the catalogSlice
      //* and when we set the productParams we will change the state of the productsLoaded to false
      //* following this passing the action payload (search Term) and overwrite the part of the state in state.productParams.
      //* In the catalog the dependancy inside UseEffect will trigger, productsLoaded will be false causing the
      //* fetchProductsAsync to run, then it will go inside get the AxiosParams and make the request to the API.
    />
  );
}

export default ProductSearch;
