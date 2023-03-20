import {
  Box,
  Button,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import Review from "./Review";
import { yupResolver } from "@hookform/resolvers/yup";
import { validationSchema } from "./checkoutValidation";
import agent from "../../app/api/agent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { clearBasket } from "../basket/basketSlice";
import { LoadingButton } from "@mui/lab";
import { StripeElementType } from "@stripe/stripe-js";
import {
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const steps = ["Shipping address", "Review your order", "Payment details"];

export default function CheckoutPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const [cardState, setCardState] = useState<{
    elementError: { [key in StripeElementType]?: string };
  }>({ elementError: {} });

  //* COMMENT: State below will check validation for input fields so we can then unlock the place order button.
  const [cardComplete, setCardComplete] = useState<any>({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });

  const [paymentMessage, setPaymentMessage] = useState("");

  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  //* getting our basket, as we need the client secret which we need to send our payment to Stripe.
  const { basket } = useAppSelector((state) => state.basket);

  const stripe = useStripe();
  const elements = useElements();

  function onCardInputChange(event: any) {
    setCardState({
      ...cardState,
      elementError: {
        ...cardState.elementError,
        [event.elementType]: event.error?.message, //event.elementType will be cardNumber, cardExpiry, cardCvc
      },
    });
    //*Assuming below spread of cardComplete will be if you're working on expiry date for example, it is keeping the val of card number and adding the state for expiry
    //* then after you click on CvC it will spread the previous two and then add the CvC....
    setCardComplete({ ...cardComplete, [event.elementType]: event.complete });
  }

  //* COMMENT: Below function is how we determine which component to return in our series of checkout pages.
  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <AddressForm />;
      case 1:
        return <Review />;
      case 2:
        return (
          <PaymentForm
            cardState={cardState}
            onCardInputChange={onCardInputChange}
          />
        );
      default:
        throw new Error("Unknown step");
    }
  }

  //* COMMENT: Below useForm declaration takes some config to be applied to the form
  //* using the yupResolver we can pass in our own validation schema so we can validate
  //* input data against the schema, and provide our own custom error messages.
  const currentValidationSchema = validationSchema[activeStep];

  const methods = useForm({
    mode: "onTouched",
    resolver: yupResolver(currentValidationSchema),
  });

  useEffect(() => {
    agent.Account.fetchAddress().then((response) => {
      if (response) {
        methods.reset({
          ...methods.getValues(),
          ...response,
          saveAddress: false,
        });
      }
    });
  }, [methods]);

  async function submitOrder(data: FieldValues) {
    setLoading(true);
    const { nameOnCard, saveAddress, ...shippingAddress } = data;
    if (!stripe || !elements) return; //* If this happens, stripe isnt ready

    try {
      const cardElement = elements.getElement(CardNumberElement);
      const paymentResult = await stripe.confirmCardPayment(
        basket?.clientSecret!,
        {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: nameOnCard,
            },
          },
        }
      );
      console.log(paymentResult);
      if (paymentResult.paymentIntent?.status === "succeeded") {
        //*If it enters this if statement, means payment on stripes end is successful
        const orderNumber = await agent.Orders.create({
          saveAddress,
          shippingAddress,
        });
        setOrderNumber(orderNumber);
        setPaymentSucceeded(true);
        setPaymentMessage("Thank You - We Have Recieved Your Payment");
        setActiveStep(activeStep + 1);
        dispatch(clearBasket());
        setLoading(false);
      } else {
        //*If it enters this loop, payment was unsuccessful
        setPaymentMessage(paymentResult.error?.message!);
        setPaymentSucceeded(false);
        setLoading(false);
        setActiveStep(activeStep + 1);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const handleNext = async (data: FieldValues) => {
    if (activeStep === steps.length - 1) {
      await submitOrder(data);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  //* Function to handle switching our submit order button on and off based on whether all the fields filled in correctly and meet validation standard.
  function submitDisabled(): boolean {
    if (activeStep === steps.length - 1) {
      return (
        !cardComplete.cardCvc ||
        !cardComplete.cardExpiry ||
        !cardComplete.cardNumber ||
        !methods.formState.isValid
      );
    } else {
      return !methods.formState.isValid;
    }
  }

  return (
    <FormProvider {...methods}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Paper>
          {activeStep === steps.length ? (
            <>
              <Typography variant="h5" gutterBottom>
                {paymentMessage}
              </Typography>
              {paymentSucceeded ? (
                <Typography variant="subtitle1">
                  Your order number is #{orderNumber}. We have not emailed your
                  order confirmation, and will not send you an update when your
                  order has shipped as this is a fake store!.
                </Typography>
              ) : (
                <Button variant="contained" onClick={handleBack}>
                  Go Back and Try Again
                </Button>
              )}
            </>
          ) : (
            <form onSubmit={methods.handleSubmit(handleNext)}>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, mr: 4 }}>
                    Back
                  </Button>
                )}
                <LoadingButton
                  loading={loading}
                  disabled={submitDisabled()}
                  type="submit"
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? "Place order" : "Next"}
                </LoadingButton>
              </Box>
            </form>
          )}
        </Paper>
      </Paper>
    </FormProvider>
  );
}
