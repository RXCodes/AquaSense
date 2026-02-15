// called when user requests to update device settings
function fetch_data(settings) {
  return fetch("/edit_settings", {
    method: "POST",
    body: JSON.stringify({
      settings: settings,
      device_id: DEVICE_ID
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}