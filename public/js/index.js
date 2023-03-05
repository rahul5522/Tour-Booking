import "@babel/polyfill";
import { loginUser } from "../js/login";
import { signupUser } from "../js/signup";
import { logout } from "./logout";
import { updateSetting } from "../js/updateUser";
import { bookTour } from "./bookTour";

// console.log(document);
// console.log("Index-form");

if (document.querySelector(".form")) {
  console.log("Login form");
  document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    loginUser(email, password);
  });
}

//Signup Form

if (document.querySelector(".signupForm")) {
  // console.log("Signup  form");
  document.querySelector(".signupForm").addEventListener("submit", (e) => {
    document.getElementById("signup_btn").textContent = "Processing........";

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    signupUser(name, email, password, passwordConfirm);
  });
}

//Update Form
if (document.querySelector(".form-user-data")) {
  // console.log("User form");
  document.querySelector(".form-user-data").addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append("email", document.getElementById("email").value);
    form.append("name", document.getElementById("name").value);
    form.append("photo", document.getElementById("photo").files[0]);
    updateSetting(form, "data");
  });
}

if (document.querySelector(".form-user-password")) {
  // console.log("Password form");
  document
    .querySelector(".form-user-password")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      document.querySelector(".btn--save-password").textContent =
        "Updating.....";
      const currentPassword = document.getElementById("password-current").value;
      const password = document.getElementById("password").value;
      const passwordConfirm = document.getElementById("password-confirm").value;
      await updateSetting(
        { currentPassword, password, passwordConfirm },
        "password"
      );

      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";

      document.getElementById("password-confirm").value = "";

      document.querySelector(".btn--save-password").textContent =
        "SAVE PASSWORD";
    });
}

const logoutBtn = document.querySelector(".nav__el--logout");

if (logoutBtn) {
  document.querySelector(".nav__el--logout").addEventListener("click", logout);
}

const bookingBtn = document.getElementById("book-tour");

if (bookingBtn) {
  bookingBtn.addEventListener("click", (e) => {
    e.target.textContent = "Processing.....";
    const tourID = e.target.dataset.tour_id;
    bookTour(tourID);
  });
}
