import { Authorization } from "../authorization.js"

/*
Endpoint: /upload_data
Body: {"time": "...", "new_data": "..."}
- time: UNIX timestamp in milliseconds
- new_data: JSON of new data points to add to the database

used to upload analytical data to the database from the device
*/

export function initialize(app) {
  app.post("/upload_data", (req, res) => {
    if (!Authorization.request_has_sensor_device_authorization(req)) {
      return;
    }
    // ...
  });
}