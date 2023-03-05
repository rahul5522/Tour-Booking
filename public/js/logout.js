import { showAlert } from "./alert";
import axios from "axios";

export const logout = async () => {
  try {
    const result = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    if (result.data.status === "Success") location.assign("/login");
  } catch (err) {
    showAlert("error", "Failed to logout, Try Again!!!!");
    // console.log(err);
  }
};
