import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Grid,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link, useNavigate } from "react-router-dom";
import agent from "../../app/api/agent";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const {
    register,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({
    mode: "onTouched",
  });

  //* COMMENT: Function uses react form function setError to provide error message to applicable text field
  //* i.e if username is already taken, writing will appear below username field to say 'Username .... is already taken'
  // ! COMMENT: This function will show Errors that come back from the API, so in order to recieve these we must make the call to the API.
  // ! With that in mind, to make things more efficient, we want to go to the API the least times possible. Certain errors can only be found out
  // ! by going to the API. E.g. Duplicate usernames and passwords because they have to be checked against the database. HOWEVER,
  // ! errors like invalid email formats (bob/test.com) and passowrds that dont meet complexity requirements, can be validated on the spot, client side.
  // ! below in passwords and email field, we have regex expressions to run against and do this validation.
  function handleApiErrors(errors: any) {
    if (errors) {
      errors.forEach((error: string) => {
        if (error.includes("Password")) {
          setError("password", { message: error });
        } else if (error.includes("Email")) {
          setError("email", { message: error });
        } else if (error.includes("Username")) {
          setError("username", { message: error });
        }
      });
    }
  }

  return (
    <Container
      component={Paper}
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
      }}
    >
      <CssBaseline />

      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Register
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit((data) =>
          agent.Account.register(data)
            .then(() => {
              toast.success("Registration Successful, You Can Now Login!");
              navigate("/login");
            })
            .catch((error) => handleApiErrors(error))
        )}
        noValidate
        sx={{ mt: 1 }}
      >
        {/* ================================================================================== */}
        {/* Username Text Entry Field */}
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          autoComplete="email"
          autoFocus
          {...register("username", { required: "Username is Required" })} //* register comes from react form hook
          error={!!errors.username}
          helperText={errors?.username?.message as string}
        />
        {/* ================================================================================== */}
        {/* Email Text Entry Field */}
        <TextField
          margin="normal"
          fullWidth
          label="Email"
          autoComplete="email"
          {...register("email", {
            required: "Email is Required",
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: "Not A Valid Email Address",
            },
          })} //* register comes from react form hook
          error={!!errors.email}
          helperText={errors?.email?.message as string}
        />

        {/* ================================================================================== */}
        {/* Password Entry Field */}
        <TextField
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password", {
            required: "Password is Required",
            pattern: {
              value:
                /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/, //* REGEX EXPRESSION TO HANDLE CLIENT SIDE VALIDATION
              message: "Password Doesn't Meet Complexity Requirements",
            },
          })}
          error={!!errors.password} //* Error Property colours the text field red if its invalid. (casts password into boolean, if it exists will be true)
          helperText={errors?.password?.message as string}
        />

        {/* ================================================================================== */}
        {/* Register Button */}
        <LoadingButton
          disabled={!isValid}
          loading={isSubmitting}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </LoadingButton>
        {/* ================================================================================== */}
        {/* ALready Have Account Link */}
        <Grid container>
          <Grid item>
            <Link to="/login">{"Already Have An Account? Sign In"}</Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Register;
