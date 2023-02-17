import { Button, Container, Divider, Paper, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const link = "/catalog";

function NotFound() {
  return (
    <Container component={Paper} sx={{ height: 400 }}>
      <Typography gutterBottom variant="h3">
        Oops - We Could Not Find What You Are Looking For
      </Typography>
      <Divider />
      <Button size="medium">
        <Link to={`/catalog`}>Go Back To Shop</Link>
      </Button>
    </Container>
  );
}

export default NotFound;
