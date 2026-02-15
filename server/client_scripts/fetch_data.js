// called when user requests analytical data for the dashboard
function fetch_data(start_date, end_date) {
  return fetch("/fetch_data", {
    method: "POST",
    body: JSON.stringify({
      start_date: start_date,
      end_date: end_date,
      device_id: DEVICE_ID
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}