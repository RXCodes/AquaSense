import { Authorization } from "../authorization.js"

/*
Endpoint: /fetch_data
Body: {"start_date": "...", "end_date": "..."}
- start_date: UNIX timestamp in milliseconds
- end_date: UNIX timestamp in milliseconds

used to fetch analytical data from the database
*/

export function initialize(app) {
  app.post("/fetch_data", (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }
    // ...
  });
}