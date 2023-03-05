import axios from "axios";
import { showAlert } from "../js/alert";

export const updateSetting = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "http://127.0.0.1:3000/api/v1/users/updatepassword"
        : "http://127.0.0.1:3000/api/v1/users/updateme";

    const updated = await axios({
      method: "PATCH",
      url,
      data: data,
    });

    if (updated.data.status === "Success") {
      showAlert("success", `${type} Updated Successfully`);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
