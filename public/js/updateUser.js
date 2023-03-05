import axios from "axios";
import { showAlert } from "../js/alert";

export const updateSetting = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updatepassword"
        : "/api/v1/users/updateme";

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
