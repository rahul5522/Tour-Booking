import axios from "axios";

export const bookTour = async (tourID) => {
  //   console.log(tourID);
  const response = await axios.get(
    `http://127.0.0.1:3000/api/v1/booking/create-payment-session/${tourID}`
  );

  //   console.log(response.data.url);

  window.location = response.data.url;
};
