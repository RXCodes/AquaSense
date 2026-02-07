/*
called when user presses sign in button in sign in page

returns a promise that resolves with the following dictionary indicating whether the sign in was successful:
{"success": true, "token": "..."}

server should respond with a temporary token that can be used to authenticate future requests
*/

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