import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { PaginatedResponse } from "../models/pagination";
import { router } from "../router/Routes";

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

axios.defaults.baseURL = "http://localhost:5000/api/";
axios.defaults.withCredentials = true;

// The code below is a type of arrow function which returns the response data
// and stores it inside responseBody. It is the shorthanded version of the following:
//! function responseBody(response: AxiosResponse) {
//!     return response.data
//! }

const responseBody = (response: AxiosResponse) => response.data;
//* Everytime we get a response from the API it will hit this interceptor allowing us to get access to the reponse and response header
axios.interceptors.response.use(
  async (response) => {
    await sleep();
    //* COMMENT: Pagination handling. It is from here that we will retrieve the pagination details from the reponse header
    //* creating a new instance of the Paginated Response Class and giving this object the values we need.
    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = new PaginatedResponse(
        response.data,
        JSON.parse(pagination)
      );
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const { data, status } = error.response as AxiosResponse;
    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors: string[] = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        }
        toast.error(data.title);
        break;
      case 401:
        toast.error(data.title);
        break;
      case 500:
        router.navigate("/server-error", { state: { error: data } });
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const requests = {
  // used for getting information from the server
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  // POST: used for creating a resource to the server
  // When sending data to the server PUT and POST use a body (presumably the information being sent)
  // which is in the form of an object (body: {})
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  // PUT: used for updating a resource on the server
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  //   DELETE: used for deleting a resource on the server
  delete: (url: string) => axios.delete(url).then(responseBody),
};

// For the Catalog we have two types of get requests.
// One API call gets the entire product LIST
// The other one gets the product DETAILS
const Catalog = {
  list: (params: URLSearchParams) => requests.get("products", params),
  details: (id: number) => requests.get(`products/${id}`),
  fetchFilters: () => requests.get("products/filters"),
};

const TestErrors = {
  get400Error: () => requests.get("buggy/Bad-Request"),
  get401Error: () => requests.get("buggy/Unauthorised"),
  get404Error: () => requests.get("buggy/Not-Found"),
  get500Error: () => requests.get("buggy/Server-Error"),
  getValidationsError: () => requests.get("buggy/Validation-Error"),
};

//* Functionality to connect front end with back end API connection points for Basket

const Basket = {
  get: () => requests.get("basket"),

  //* bellow functionality matches up with AddItemToBasket in basketcontroller.
  addItem: (productId: number, quantity = 1) =>
    requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
  removeItem: (productId: number, quantity = 1) =>
    requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
};

const agent = {
  Catalog,
  TestErrors,
  Basket,
};

export default agent;
