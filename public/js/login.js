/* eslint-disable no-undef */
import axios from "axios";
import { showAlert } from "./alert";
import { hideAlert } from "./alert";

export const loginUser = async (email, password) => {
  try {
    const result = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/users/login",
      data: {
        email: email,
        password: password,
      },
    });

    if (result.data.status === "Success") {
      showAlert("success", "Successfully logged in");
      location.assign("/");
    }
  } catch (err) {
    showAlert("error", "Wrong credentials");
  }
};
