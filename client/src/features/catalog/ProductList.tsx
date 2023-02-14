import React from "react";
import { Product } from "../../app/layout/models/products";
import {
  Avatar,
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
  return (
    <Grid container spacing={4}>
      {products.map((product) => (
        <Grid item xs={3} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
}
