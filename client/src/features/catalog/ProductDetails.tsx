import { LoadingButton } from "@mui/lab";
import {
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../../app/errors/NotFound";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import {
  addBasketItemsAsync,
  removeBasketItemAsync,
} from "../basket/basketSlice";
import { fetchProductAsync, productSelectors } from "./catalogSlice";

function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  // Get basket from basketSlice
  const { basket, status } = useAppSelector((state) => state.basket);
  const { status: productStatus } = useAppSelector((state) => state.catalog); //syntax status: product status differentiates it from the status coming from the basketSlice
  const dispatch = useAppDispatch();
  // const [product, setProduct] = useState<Product | null>(null);  //! This line is depreciated as state is now kept in the store, not local state
  const product = useAppSelector(
    (state) => productSelectors.selectById(state, id!) //!had to put ! here because was complaining about string being string | undefined....no idea
  );
  // first loading occurs on getting data from API ---- //!Depreciated because of centralised store
  //* const [loading, setLoading] = useState(true);
  // check how many of the item user already has in basket
  const [quantity, setQuantity] = useState(0);
  // Seperate Loading indicator for when we update the quantity inside basket inside API
  // const [submitting, setSubmitting] = useState(false); //!Depreciated
  const item = basket?.items.find((i) => i.productId === product?.id);

  // Because the Id is a string, we need to parse it first as an int
  // the 'id &&' at the start is needed to for error handling purposes
  // basically means checks that id has value first.
  //* added code to make the content of quantity in cart dynamic
  //* above gets the basket...uses find to loop on the basketItems...if that items id matches the id of the product being displayed
  //* on this current productDetails page then below, set the quantity(local state) to the quantity in the basket
  useEffect(() => {
    if (item) setQuantity(item.quantity);
    if (!product && id) dispatch(fetchProductAsync(parseInt(id)));
  }, [id, item, dispatch, product]);

  //* Function to deal with the quantity in cart input
  //* uses the the event on change of the input field to re-set the quantity in cart.
  //* checks if greater or equal to zero, this stops it going into negative numbers but also lets you reduce item to none.
  function handleInputChange(event: any) {
    if (event.target.value >= 0) {
      setQuantity(parseInt(event.target.value));
    }
  }

  //* Function to give Update/Add To cart Functionality to the button depending on the status of the object displayed
  //* If item already exists in basket we can update the number of that item in the basket
  //* If the item does not exist in the basket then we can add it to the basket
  //* Logic needs to cover 3 aspects: 1) Are we removing/ reducing items from the cart? 2)Are we Adding to existing in cart? 3) Adding new Item
  function handleUpdateCart() {
    // need to check if we have an item?
    // need to check if we the local state (quantity) is greater than the item(API) quantity
    // (if this is true means that we have 'increased' the quantity locally and will need to update the API/basket)
    // (if false (item doesnt exist) means we just add quantity because we are adding a new item, no existing quantity to alter)
    if (!item || quantity > item.quantity) {
      const updatedQuantity = item ? quantity - item.quantity : quantity;
      dispatch(
        addBasketItemsAsync({
          productId: product?.id!,
          quantity: updatedQuantity,
        })
      );

      // ================================================================================\\
      //*Below commented out code is before we centralised API calls to the basketSlice.
      // agent.Basket.addItem(product?.id!, updatedQuantity)
      //   .then((basket) => dispatch(setBasket(basket)))
      //   .catch((error) => console.log(error))
      //   .finally(() => setSubmitting(false));
      // ================================================================================\\
    } else {
      // if we do have the item or the quantity is less than the item.quantity
      const updatedQuantity = item.quantity - quantity;
      dispatch(
        removeBasketItemAsync({
          productId: product?.id!,
          quantity: updatedQuantity,
        })
      );

      // ================================================================================\\
      //*Below commented out code is before we centralised API calls to the basketSlice.
      // agent.Basket.removeItem(product?.id!, updatedQuantity)
      //   .then(() =>
      //     dispatch(
      //       removeItem({ productId: product?.id!, quantity: updatedQuantity })
      //     )
      //   )
      //   .catch((error) => console.log(error))
      //   .finally(() => setSubmitting(false));
      // ================================================================================\\
    }
  }

  if (productStatus.includes("pending"))
    return <LoadingComponent message="Loading Product..." />;

  if (!product) return <NotFound />;

  return (
    <Grid container spacing={6}>
      {/* ===================================================================== */}
      {/* ===================================================================== */}
      {/* Image Grid Item */}
      <Grid item xs={6}>
        <img
          src={product.pictureUrl}
          alt={product.name}
          style={{ width: "100%" }}
        />
      </Grid>
      {/* ===================================================================== */}
      {/* ===================================================================== */}
      {/* Product Information Grid */}
      <Grid item xs={6}>
        <Typography variant="h3">{product.name}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h4" color="secondary">
          ${(product.price / 100).toFixed(2)}
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              {/* ===================================================================== */}
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{product.name}</TableCell>
              </TableRow>
              {/* ===================================================================== */}
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>{product.description}</TableCell>
              </TableRow>
              {/* ===================================================================== */}
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>{product.type}</TableCell>
              </TableRow>
              {/* ===================================================================== */}
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>{product.brand}</TableCell>
              </TableRow>
              {/* ===================================================================== */}
              <TableRow>
                <TableCell>Quantity In Stock</TableCell>
                <TableCell>{product.quantityInStock}</TableCell>
              </TableRow>
              {/* ===================================================================== */}
            </TableBody>
          </Table>
        </TableContainer>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              onChange={handleInputChange}
              variant="outlined"
              type="number"
              label="Quantity In Cart"
              fullWidth
              value={quantity}
            />
          </Grid>
          <Grid item xs={6}>
            <LoadingButton
              loading={status.includes("pending")}
              sx={{ height: "55px" }}
              color="primary"
              size="large"
              variant="contained"
              fullWidth
              onClick={handleUpdateCart}
              //! if the API quantity matches local state quantity, disable button because there is no updating to do
              //! OR if there is no item and quantity is 0 disable because you shouldnt be able to add 0 quantity of something to the cart.
              disabled={
                item?.quantity === quantity || (!item && quantity === 0)
              }
            >
              {item ? "Update Quantity" : "Add To Cart"}
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ProductDetails;
