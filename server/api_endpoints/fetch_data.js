import { Authorization } from "../authorization.js";
import { Database } from "../database.js";
import { DeviceManager } from "../device_manager.js";

export function initialize(app) {
  app.post("/fetch_data", async (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({ success: false, error: "unauthorized" });
      return;
    }

    // get the device id from the request
    let device_id = req.body.device_id;
    if (!device_id) {
      res.send({ success: false, error: "missing device_id" });
      return;
    }

    // fetch the data from the database
    let path = "devices/" + device_id + "/data.json";
    var data = await Database.read_text(path, "{}");
    if (!data.success) {
      res.send({ success: false, error: "failed to fetch data" });
      return;
    }

    // return the data if any
    data = JSON.parse(data.text);
    if (!data.last_updated) {
      res.send({ success: false, error: "no recorded data found" });
      return;
    }

    // get device creation time'
    // remove data points that were recorded before the device was created
    let creation_date = DeviceManager.get_device(device_id).creation_date;
    data.points = data.points.filter(point => point.time >= creation_date);
    
    res.send({ success: true, last_updated: data.last_updated, data: data });
  });
}
