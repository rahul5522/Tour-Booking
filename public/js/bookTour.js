import axios from "axios";

export const bookTour = async (tourID) => {
  //   console.log(tourID);
  const response = await axios.get(
    `/api/v1/booking/create-payment-session/${tourID}`
  );

  //   console.log(response.data.url);

  window.location = response.data.url;
};
