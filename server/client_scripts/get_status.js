// called when user requests the device status
function get_status() {
  return fetch("/get_status", {
    method: "POST",
    body: JSON.stringify({
      device_id: DEVICE_ID
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}