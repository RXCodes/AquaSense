import { Database } from "./database.js"

// locally keep track of devices - array<device>
var registered_devices = null;
var pairing_devices = [];
export const DeviceManager = {
  get_registered_devices,
  add_device,
  remove_device,
  get_pairing_devices,
  add_pairing_device,
  remove_pairing_device,
  initialize
}

function get_registered_devices() {
  return registered_devices; 
}

function add_device(name, device_id, device_token) {
  // add the device to the list of registered devices
  let device = {
    "device_id": device_id,
    "name": name,
    "device_token": device_token,
    "creation_date": Date.now() / 1000
  }
  registered_devices.push(device);
  Database.upload_text("device_list.json", JSON.stringify(registered_devices));

  // create the device status file in the database
  Database.upload_text("devices/" + device_id + "/device_status.json", JSON.stringify({
    "last_updated": Date.now() / 1000
  }));
}

function remove_device(device_id) {
  // remove the device from the list of registered devices
  // on the database, delete the device's directory
  registered_devices = registered_devices.filter(device => device.device_id != device_id);
  Database.upload_text("device_list.json", JSON.stringify(registered_devices));
  Database.delete_path("devices/" + device_id);
}

function get_pairing_devices() {
  return pairing_devices;
}

function add_pairing_device(device_id, name) {
  pairing_devices.push({
    "device_id": device_id,
    "name": name,
    "request_time": Date.now() / 1000
  });
}

function remove_pairing_device(device_id) {
  pairing_devices = pairing_devices.filter(device => device.device_id != device_id);
}

async function initialize() {
  let data = await Database.read_text("device_list.json", "[]");
  if (!data.success) {
    throw new Error("Failed to fetch devices from database: " + data.error);
  }
  registered_devices = JSON.parse(data.text);
  console.log("Registered " + registered_devices.length + " devices.");
}