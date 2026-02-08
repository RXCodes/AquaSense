/*
called when user requests to update device settings

returns a promise that resolves with the following dictionary indicating whether the request was successful:
{"success": true}

server should respond with the following dictionary above
settings should be a dictionary of settings to update
*/

function fetch_data(settings) {
  return fetch("/edit_settings", {
    method: "POST",
    body: JSON.stringify(settings),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}