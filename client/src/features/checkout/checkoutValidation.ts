import * as yup from "yup";

export const validationSchema = [
  yup.object({
    fullName: yup.string().required("Full Name is Required"),
    address1: yup.string().required("Address Line 1 is Required"),
    address2: yup.string(),
    city: yup.string().required("City of Residence is Required"),
    state: yup.string().required("State of Residence is Required"),
    postCode: yup.string().required("Post Code is Required"),
    country: yup.string().required("Country of Residence is Required"),
  }),

  yup.object(),
  yup.object({
    nameOnCard: yup.string().required("Name on Card is Required"),
  }),
];
