import { useEffect } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { fetchProductsAsync, productSelectors } from "./catalogSlice";
import ProductList from "./ProductList";

export default function Catalog() {
  //* useState variable populates from useEffect fetch call to database and setProducts function call which returns an array of the products.
  //* useState is expecting Product array which fits the interface imported from products.ts -------STATE NOW CENTRALISED IN SLICE
  // const [products, setProducts] = useState<Product[]>([]);

  //* By having our products data stored in the slice we now only fetch it on App Startup
  //* previous method using local state fetches the data everytime you return to the component
  const products = useAppSelector(productSelectors.selectAll);
  const dispatch = useAppDispatch();
  const { productsLoaded, status } = useAppSelector((state) => state.catalog);
  //* useEffect is using the fetch call to the API product list, returning as json, then as data.
  useEffect(() => {
    if (!productsLoaded) dispatch(fetchProductsAsync());
  }, [productsLoaded, dispatch]);

  if (status.includes("pending"))
    return <LoadingComponent message="Loading Catalog..." />;

  return (
    <>
      <ProductList products={products} />
    </>
  );
}
