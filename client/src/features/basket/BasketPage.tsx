import { Add, Delete, Remove } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { addBasketItemsAsync, removeBasketItemAsync } from "./basketSlice";
import BasketSummary from "./BasketSummary";

function BasketPage() {
  //!==================== this functionality now in App.tsx and Store Context.tsx  =========================================\\\
  //   //*Functionality for the basket page has a loading variable which brings up a loading spinner
  //   //*and some text while the page loads. Also the

  //   const [loading, setLoading] = useState(true);
  //   const [basket, setBasket] = useState<Basket | null>(null);

  //   //* useEffect returns the basket entity and sets piece of state "basket" (above) to the basket entity in the backend
  //   //* and finally changes the loading status so the spinner disappears and basket page appears.
  //   useEffect(() => {
  //     agent.Basket.get()
  //       .then((basket) => setBasket(basket))
  //       .catch((error) => console.log(error))
  //       .finally(() => setLoading(false));
  //   }, []);

  //   if (loading) return <LoadingComponent message="Loading Basket..." />;
  //!=======================================================================================================================\\\

  // * Destructuring what we want our state to be using the custom hook useAppSelector
  //* Basically saying i want to take the basket state from our basket slice?
  const { basket, status } = useAppSelector((state) => state.basket);
  const dispatch = useAppDispatch();

  // ================================================================================\\
  //* Functions below making API calls before centralising to basketSlice for all API calls
  // function handleAddItem(productId: number, name: string) {
  //   setStatus({ loading: true, name });
  //   agent.Basket.addItem(productId)
  //     .then((basket) => dispatch(setBasket(basket)))
  //     .catch((error) => console.log(error))
  //     .finally(() => setStatus({ loading: false, name: "" }));
  // }

  // function handleRemoveItem(productId: number, quantity = 1, name: string) {
  //   setStatus({ loading: true, name: name });
  //   agent.Basket.removeItem(productId, quantity)
  //     .then(() => dispatch(removeItem({ productId, quantity })))
  //     .catch((error) => console.log(error))
  //     .finally(() => setStatus({ loading: false, name: "" }));
  // }
  // ================================================================================\\

  if (!basket)
    return <Typography variant="h3">Your Basket Is Empty</Typography>;

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            {/* TABLE ROW 1 ---- Contains headings */}
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          {/* =================Begin Table Body============= */}
          <TableBody>
            {basket.items.map((item) => (
              <TableRow
                key={item.productId}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {/*============= Table Cell containing the image and name of product ===============*/}
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center">
                    <img
                      src={item.pictureUrl}
                      alt={item.name}
                      style={{ height: 50, marginRight: 20 }}
                    />
                    <span>{item.name}</span>
                  </Box>
                </TableCell>
                {/*================ Table cell containing the price of individual item ===============*/}
                <TableCell align="right">
                  ${(item.price / 100).toFixed(2)}
                </TableCell>
                {/*============== Table Cell containing the quantity of each item in the basket ==========*/}
                {/* Contains two icon buttons to increase or decrease quantity of said item */}
                <TableCell align="center">
                  <LoadingButton
                    loading={
                      status === "pendingRemoveItem" + item.productId + "rem"
                    }
                    color="error"
                    onClick={() =>
                      dispatch(
                        removeBasketItemAsync({
                          productId: item.productId,
                          quantity: 1,
                          name: "rem",
                        })
                      )
                    }
                  >
                    <Remove />
                  </LoadingButton>
                  {item.quantity}
                  <LoadingButton
                    loading={status === "pendingAddItem" + item.productId}
                    color="primary"
                    onClick={() =>
                      dispatch(
                        addBasketItemsAsync({
                          productId: item.productId,
                        })
                      )
                    }
                  >
                    <Add />
                  </LoadingButton>
                </TableCell>
                {/*============== Table Cell to show subtotal of each item. i.e 2 items of 100. subtotal is 200 =========*/}
                <TableCell align="right">
                  {((item.price / 100) * item.quantity).toFixed(2)}
                </TableCell>
                {/*============== Table Cell containing the delete item button ===========================================*/}
                <TableCell align="right">
                  <LoadingButton
                    loading={
                      status === "pendingRemoveItem" + item.productId + "del"
                    }
                    color="error"
                    onClick={() =>
                      dispatch(
                        removeBasketItemAsync({
                          productId: item.productId,
                          quantity: item.quantity,
                          name: "del",
                        })
                      )
                    }
                  >
                    <Delete />
                  </LoadingButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container>
        {/* Grid Container to add the basket summary to the bottom of the basket table
            the Grid strangely has two items in it despite there only being one containing the basket summary
            the first self closing is actually there but empty and pushing the summary to the right under the subtotals */}
        <Grid item xs={6}></Grid>
        <Grid item xs={6}>
          <BasketSummary />
          <Button
            component={Link}
            to="/checkout"
            variant="contained"
            size="large"
            fullWidth
          >
            Checkout
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default BasketPage;
