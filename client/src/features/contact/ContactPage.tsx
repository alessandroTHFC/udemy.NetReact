import { Button, ButtonGroup, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { decrement, increment } from "./counterSlice";

function ContactPage() {
  const dispatch = useAppDispatch();
  const { data, title } = useAppSelector((state) => state.counter);

  return (
    <>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="h5" fontSize="18px">
        The Data is: {data}{" "}
      </Typography>
      <ButtonGroup>
        <Button
          onClick={() => dispatch(decrement(1))}
          variant="contained"
          color="error"
        >
          Decrement
        </Button>
        <Button
          onClick={() => dispatch(increment(1))}
          variant="contained"
          color="error"
        >
          Increment
        </Button>
        <Button
          onClick={() => dispatch(increment(5))}
          variant="contained"
          color="secondary"
        >
          Increment by 5
        </Button>
      </ButtonGroup>
    </>
  );
}

export default ContactPage;
