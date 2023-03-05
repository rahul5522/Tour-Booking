import axios from "axios";
import { showAlert } from "./alert";

export const signupUser = async (name, email, password, passwordConfirm) => {
  try {
    const result = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/users/signup",
      data: {
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      },
    });

    if (result.data.status === "Success") {
      showAlert("success", "Successfully Signup");
      location.assign("/");
    }
  } catch (err) {
    showAlert("error", "Wrong credentials");
  }
};
