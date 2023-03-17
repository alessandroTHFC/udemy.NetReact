import { Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/store/configureStore";
import BasketSummary from "./BasketSummary";
import BasketTable from "./BasketTable";

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
  const { basket } = useAppSelector((state) => state.basket);

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
      <BasketTable items={basket.items} />
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
