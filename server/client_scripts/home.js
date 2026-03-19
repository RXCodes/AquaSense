// API call to authorize the user
function attempt_sign_in(username, password) {
  return fetch("/authorize", {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// called when user presses sign in button
var signing_in = false;
async function sign_in_clicked() {
  if (signing_in) {
    return;
  }
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  username.trim();
  password.trim();
  if (username.length == 0 || password.length == 0) {
    show_alert("Credentials cannot be blank.", "error");
    return;
  }

  // then hit an API call to the server
  signing_in = true;
  let submit_button = document.getElementById('submit-btn');
  submit_button.innerHTML = "Signing In...";
  submit_button.style.opacity = 0.75;
  var result = await attempt_sign_in(username, password);
  let data = await result.json();

  let username_field = document.getElementById('username');
  let password_field = document.getElementById('password');

  if (!data.success) {
    // outline red on the username and password fields
    username_field.style.outline = "2px solid red";
    password_field.style.outline = "2px solid red";
    submit_button.innerHTML = "Sign In";
    submit_button.style.opacity = 1.0;
    signing_in = false;
    show_alert("Invalid username or password.", "error");
    return;
  }

  // success - save the token to a cookie to use later
  set_cookie("authorization", data.token);

  // outline green on the username and password fields
  username_field.style.outline = "2px solid #00BB78";
  password_field.style.outline = "2px solid #00BB78";

  // redirect to the devices page
  window.location.href = "/devices";
}