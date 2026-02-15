export function initialize(app) {
  app.post("/update_device_status", (req, res) => {
    // check if the request has a valid device token
    if (!Authorization.request_has_sensor_device_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
    }

    // get the device id from the request
    let device_id = Authorization.get_device_id_from_request(req);
    let device_status = req.body.info;
    if (!device_status) {
      res.send({"success": false, "error": "missing info"});
      return;
    }

    // update the device status in the database
    device_status.last_updated = Date.now() / 1000;
    let path = "devices/" + device_id + "/device_status.json";
    Database.upload_text(path, JSON.stringify(device_status));
    res.send({"success": true});
  });
}