import { useEffect, useState } from "react";
import { Product } from "../../app/layout/models/products";
import ProductList from "./ProductList";

export default function Catalog() {
  //* useState variable populates from useEffect fetch call to database and setProducts function call which returns an array of the products.
  //* useState is expecting Product array which fits the interface imported from products.ts
  const [products, setProducts] = useState<Product[]>([]);

  //* useEffect is using the fetch call to the API product list, returning as json, then as data.
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <>
      <ProductList products={products} />
    </>
  );
}
