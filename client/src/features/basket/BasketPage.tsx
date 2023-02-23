import { Add, Delete, Remove } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Grid,
  IconButton,
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
import { useState } from "react";
import { Link } from "react-router-dom";
import agent from "../../app/api/agent";
import { useStoreContext } from "../../app/context/StoreContext";
import Checkout from "../checkout/Checkout";
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

  const { basket, setBasket, removeItem } = useStoreContext();
  const [status, setStatus] = useState({
    loading: false,
    name: "",
  });

  function handleAddItem(productId: number, name: string) {
    setStatus({ loading: true, name });
    agent.Basket.addItem(productId)
      .then((basket) => setBasket(basket))
      .catch((error) => console.log(error))
      .finally(() => setStatus({ loading: false, name: "" }));
  }

  function handleRemoveItem(productId: number, quantity = 1, name: string) {
    setStatus({ loading: true, name: name });
    agent.Basket.removeItem(productId, quantity)
      .then(() => removeItem(productId, quantity))
      .catch((error) => console.log(error))
      .finally(() => setStatus({ loading: false, name: "" }));
  }

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
                      status.loading && status.name === "rem" + item.productId
                    }
                    color="error"
                    onClick={() =>
                      handleRemoveItem(
                        item.productId,
                        1,
                        "rem" + item.productId
                      )
                    }
                  >
                    <Remove />
                  </LoadingButton>
                  {item.quantity}
                  <LoadingButton
                    loading={
                      status.loading && status.name === "add" + item.productId
                    }
                    color="primary"
                    onClick={() =>
                      handleAddItem(item.productId, "add" + item.productId)
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
                      status.loading && status.name === "del" + item.productId
                    }
                    color="error"
                    onClick={() =>
                      handleRemoveItem(
                        item.productId,
                        item.quantity,
                        "del" + item.productId
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
