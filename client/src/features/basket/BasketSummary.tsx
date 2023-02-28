import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import { useStoreContext } from "../../app/context/StoreContext";
import { useAppSelector } from "../../app/store/configureStore";
import { currencyFormat } from "../../app/utils/Utils";

export default function BasketSummary() {
  //* get basket from storecontext
  const { basket } = useAppSelector((state) => state.basket);
  //* reduce basket array
  //* get subtotal
  // reduce function is creating a sum(end result) and getting the quantity
  // multiplied by the price of each item. first 0 means start from 0. Second zero means
  // if the subtotal is undefined(empty basket) then return 0
  const subtotal =
    basket?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) ??
    0;
  // conditional for if value is over 100.
  const deliveryFee = subtotal > 10000 ? 0 : 500;

  return (
    <>
      <TableContainer component={Paper} variant={"outlined"}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2}>Subtotal</TableCell>
              <TableCell align="right">{currencyFormat(subtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Delivery fee*</TableCell>
              <TableCell align="right">{currencyFormat(deliveryFee)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="right">
                {currencyFormat(subtotal + deliveryFee)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span style={{ fontStyle: "italic" }}>
                  *Orders over $100 qualify for free delivery
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
