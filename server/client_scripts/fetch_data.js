/*
called when user requests analytical data for the dashboard

returns a promise that resolves with the following dictionary indicating whether the request was successful:
{"success": true, "data": "..."}

server should respond with data within the specified date range
*/

function fetch_data(start_date, end_date) {
  return fetch("/fetch_data", {
    method: "POST",
    body: JSON.stringify({
      start_date: start_date,
      end_date: end_date
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}