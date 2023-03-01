import { Grid, Paper } from "@mui/material";
import { useEffect } from "react";
import AppPagination from "../../app/components/AppPagination";
import CheckBoxButtons from "../../app/components/CheckBoxButtons";
import RadioButtonGroup from "../../app/components/RadioButtonGroup";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import {
  fetchFilters,
  fetchProductsAsync,
  productSelectors,
  setPageNumber,
  setProductParams,
} from "./catalogSlice";
import ProductList from "./ProductList";
import ProductSearch from "./ProductSearch";

const sortOptions = [
  { value: "name", label: "Alphabetical" },
  { value: "priceDesc", label: "Price - High to Low" },
  { value: "price", label: "Price - Low to High" },
];

export default function Catalog() {
  //* COMMENT: useState variable populates from useEffect fetch call to database and setProducts function call which returns an array of the products.
  //* useState is expecting Product array which fits the interface imported from products.ts -------STATE NOW CENTRALISED IN SLICE
  // const [products, setProducts] = useState<Product[]>([]);

  //* COMMENT: By having our products data stored in the slice we now only fetch it on App Startup
  //* previous method using local state fetches the data everytime you return to the component
  const products = useAppSelector(productSelectors.selectAll);
  const dispatch = useAppDispatch();
  //* Below are all variables we are pulling from our Catalog state inside catalogSlice.
  const {
    productsLoaded,
    filtersLoaded,
    types,
    brands,
    productParams,
    metaData,
  } = useAppSelector((state) => state.catalog);
  //* COMMENT:  useEffect is using the fetch call to the API product list, returning as json, then as data.
  useEffect(() => {
    if (!productsLoaded) dispatch(fetchProductsAsync());
  }, [productsLoaded, dispatch]);
  //* COMMENT: Secondary useEffect because having filtersLoaded in above was causing secondary unnecessary API call
  //* On products loaded when filtersLoaded was changing to true.
  useEffect(() => {
    if (!filtersLoaded) dispatch(fetchFilters());
  }, [filtersLoaded, dispatch]);

  if (!filtersLoaded) return <LoadingComponent message="Loading Catalog..." />;

  return (
    <Grid container columnSpacing={4}>
      {/* ==========================Filter GridSection================================== */}
      <Grid item xs={3}>
        {/*==========================SearchBox Item================================== */}
        <Paper sx={{ mb: 2 }}>
          <ProductSearch />
        </Paper>
        {/*==========================RadioButton Group================================== */}
        <Paper sx={{ mb: 2, p: 2 }}>
          <RadioButtonGroup
            selectedValue={productParams.orderBy}
            options={sortOptions}
            //* COMMENT: on change event will call function to dispatch our reducer function and change the orderBy field with the radio button value selected
            onChange={(e) =>
              dispatch(setProductParams({ orderBy: e.target.value }))
            }
          />
        </Paper>
        {/* ==========================Brand CheckBox GridSection================================== */}
        <Paper sx={{ mb: 2, p: 2 }}>
          <CheckBoxButtons
            items={brands}
            checked={productParams.brands}
            onChange={(items: string[]) =>
              dispatch(setProductParams({ brands: items }))
            }
          />
        </Paper>
        {/* ==========================Types CheckBox GridSection================================== */}
        <Paper sx={{ mb: 2, p: 2 }}>
          <CheckBoxButtons
            items={types}
            checked={productParams.types}
            onChange={(items: string[]) =>
              dispatch(setProductParams({ types: items }))
            }
          />
        </Paper>
      </Grid>
      {/* ==========================ProductCard GridSection================================== */}
      <Grid item xs={9}>
        <ProductList products={products} />
      </Grid>
      {/* ==========================Pagination GridSection================================== */}
      <Grid item xs={3} />
      <Grid item xs={9} sx={{ mb: 2 }}>
        {metaData && (
          <AppPagination
            metaData={metaData}
            onPageChange={(page: number) =>
              dispatch(setPageNumber({ pageNumber: page }))
            }
          />
        )}
      </Grid>
    </Grid>
  );
}
