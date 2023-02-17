import { useEffect, useState } from "react";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Product } from "../../app/layout/models/products";
import ProductList from "./ProductList";

export default function Catalog() {
  //* useState variable populates from useEffect fetch call to database and setProducts function call which returns an array of the products.
  //* useState is expecting Product array which fits the interface imported from products.ts
  const [products, setProducts] = useState<Product[]>([]);

  const [Loading, setLoading] = useState(true);

  //* useEffect is using the fetch call to the API product list, returning as json, then as data.
  useEffect(() => {
    agent.Catalog.list()
      .then((products) => setProducts(products))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  if (Loading) return <LoadingComponent message="Loading Catalog..." />;

  return (
    <>
      <ProductList products={products} />
    </>
  );
}
