import { Authorization } from "../authorization.js";
import { DeviceManager } from "../device_manager.js";

export function initialize(app) {
  app.post("/get_device_status", async (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({ success: false, error: "unauthorized" });
      return;
    }

    // get the device id from the request
    let device_id = req.body.device_id;
    if (!device_id) {
      res.send({ success: false, error: "missing device id" });
      return;
    }

    // check if the device is registered
    let registered_devices = DeviceManager.get_registered_devices();
    let device = registered_devices.find(
      (device) => device.device_id == device_id,
    );
    if (!device) {
      res.send({ success: true, registered: false });
      return;
    }

    // return the device status
    res.send({
      success: true,
      registered: true,
      info: {}
    });
  });
}
