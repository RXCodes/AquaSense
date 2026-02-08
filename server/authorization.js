export const Authorization = {
  authorize_request,
  request_has_user_authorization,
  request_has_sensor_device_authorization,
  log_out_user,
};

// keep track of session tokens
var active_tokens = [];

// tokens expire after 15 minutes
const expiration_time = 15 * 60 * 1000;

// generate a random token
function generate_token() {
  let token = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    token += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return token;
}

// authorize a request with username and password - generate a new token on success
export function authorize_request(req, res) {
  if (
    process.env.username == req.body.username &&
    process.env.password == req.body.password
  ) {
    // generate a new token and add it to the list of active tokens
    let token = generate_token();
    while (active_tokens.includes(token)) {
      token = generate_token();
    }
    active_tokens.push(token);

    // send a success response with the token
    res.cookie("authorization", token, { maxAge: expiration_time });
    res.send({ success: true, token: token });

    // remove the token after a certain amount of time
    setTimeout(function () {
      if (active_tokens.includes(token)) {
        active_tokens.splice(active_tokens.indexOf(token), 1);
      }
    }, expiration_time);
    return;
  }

  // if the username or password is incorrect, send a failure response
  res.send({ success: false });
}

// check if the request has a valid authorization token
export function request_has_user_authorization(req) {
  let token = req.cookies.authorization || "unknown";
  if (active_tokens.includes(token)) {
    return true;
  }
  return false;
}

// check if the request has a valid authorization token
export function request_has_sensor_device_authorization(req) {
  let token = req.cookies.authorization || "unknown";
  if (process.env.device_token == token) {
    return true;
  }
  return false;
}

// log out a user given a request and remove token from active tokens
export function log_out_user(req, res) {
  let token = req.cookies.authorization || "unknown";
  if (active_tokens.includes(token)) {
    active_tokens.splice(active_tokens.indexOf(token), 1);
  }
  res.clearCookie("authorization");
  res.redirect("/");
}
