// called when user requests to update device settings
function get_devices() {
  return fetch("/get_devices", {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// display devices on the page
function show_devices(devices) {
  var list = document.getElementById("device-list");
  list.innerHTML = "";
  if (!devices || devices.length == 0) {
    var empty = document.createElement("p");
    empty.className = "empty-message";
    empty.setAttribute("data-testid", "text-empty-devices");
    empty.textContent = "No devices found.";
    list.appendChild(empty);
    return;
  }

  for (var i = 0; i < devices.length; i++) {
    var device = devices[i];

    // create the card
    var card = document.createElement("div");
    card.className = "device-card";
    card.setAttribute("data-testid", "card-device-" + (device.id || i));

    // create the icon
    var iconWrapper = document.createElement("div");
    iconWrapper.className = "device-icon";
    iconWrapper.innerHTML = device_icon_svg;

    // create the info section
    var info = document.createElement("div");
    info.className = "device-info";
    var name = document.createElement("div");
    name.className = "device-name";
    name.setAttribute("data-testid", "text-device-name-" + (device.id || i));
    name.textContent = device.name || "Unknown Device";
    var desc = document.createElement("div");
    desc.className = "device-description";
    desc.setAttribute("data-testid", "text-device-desc-" + (device.id || i));
    var descText = "ID: " + (device.id || "N/A");
    if (device.creation_date) {
      let date = new Date(device.creation_date * 1000);
      descText += "\nCreated " + date.toLocaleString()
    }
    desc.textContent = descText;
    desc.style.whiteSpace = "pre-line";

    info.appendChild(name);
    info.appendChild(desc);

    // create the select button
    var btn = document.createElement("button");
    btn.className = "device-select-btn";
    btn.setAttribute("data-testid", "button-select-device-" + (device.id || i));
    btn.textContent = "Select";
    btn.setAttribute("data-device-id", device.id || "");
    btn.onclick = function() {
      device_selected(this.getAttribute("data-device-id"));
    };

    card.appendChild(iconWrapper);
    card.appendChild(info);
    card.appendChild(btn);
    list.appendChild(card);
  }
}

// called when user selects a device
function device_selected(device_id) {
  set_cookie("device_id", device_id);
  window.location.href = "/dashboard";
}

// called when user clicks the pair new device button
function pair_new_device() {
  window.location.href = "/pair_device";
}

// the svg for the device icon - will be fetched in load_devices()
var device_icon_svg = '';

// called when the page loads
async function load_devices() {
  // first, fetch the device icon svg
  let device_icon = await fetch("/images/device.svg");
  if (!device_icon.ok) {
    show_alert("Failed to fetch devices. Please try again.", "error");
    empty.textContent = "Failed to fetch devices.";
    return
  }
  device_icon_svg = await device_icon.text();

  // now fetch the devices
  let response = await get_devices();
  response = await response.json();
  if (!response.success) {
    show_alert("Server Error: " + response.error, "error");
    empty.textContent = "Failed to fetch devices.";
    return;
  }
  show_devices(response.devices);
}
load_devices();