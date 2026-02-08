/*
called when user requests the device status

returns a promise that resolves with the following dictionary indicating whether the request was successful:
{"success": true, "status": {...}}

server should respond with the following dictionary above
status should be a dictionary of revelant status information such as last update time, battery level, etc.
*/

function get_status() {
  return fetch("/get_status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}