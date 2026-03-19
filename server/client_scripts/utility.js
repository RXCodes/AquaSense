// utility.js -- client-side code that is used across all pages
// this script is loaded in all pages to provide utility functions

// get a cookie by name
function get_cookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// set a cookie by name
function set_cookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue + ";path=/";
}

// constants that can be used in other client scripts
const DEVICE_ID = get_cookie("device_id");

// called when alert is closed
var close_function = null;

// display a stylized alert
function show_alert(message, type = "info", duration = 4000) {
  var overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding-top:70px;opacity:0;transition:opacity 0.25s ease;";

  var accent_color = type == "success" ? "#00FFAE" : type == "error" ? "#FF4D4D" : "#5680FF";
  var icon_symbol = type == "success" ? "\u2713" : type == "error" ? "\u2717" : "\u24D8";

  var alert_box = document.createElement("div");
  alert_box.style.cssText = "width:90%;max-width:480px;background:linear-gradient(180deg,#1E1E1E 0%,rgba(30,30,30,0.95) 100%);border-radius:10px;padding:1.25rem 1.5rem;display:flex;align-items:flex-start;gap:0.75rem;box-shadow:0 10px 30px rgba(0,0,0,0.4);border-left:3px solid " + accent_color + ";transform:translateY(-10px);transition:transform 0.25s ease;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;";

  var icon = document.createElement("span");
  icon.textContent = icon_symbol;
  icon.style.cssText = "color:" + accent_color + ";font-size:1.25rem;flex-shrink:0;line-height:1.4;";

  var text = document.createElement("span");
  text.textContent = message;
  text.style.cssText = "color:#E0E0E0;font-size:0.9375rem;font-weight:400;flex:1;line-height:1.4;";

  var close_button = document.createElement("button");
  close_button.textContent = "\u2715";
  close_button.style.cssText = "background:none;border:none;color:#808080;font-size:1rem;cursor:pointer;flex-shrink:0;padding:0;line-height:1;transition:color 0.15s ease;";
  close_button.onmouseenter = function() { close_button.style.color = "#FFFFFF"; };
  close_button.onmouseleave = function() { close_button.style.color = "#808080"; };

  alert_box.appendChild(icon);
  alert_box.appendChild(text);
  alert_box.appendChild(close_button);
  overlay.appendChild(alert_box);
  document.body.appendChild(overlay);

  requestAnimationFrame(function() {
    overlay.style.opacity = "1";
    alert_box.style.transform = "translateY(0)";
  });

  function dismiss() {
    overlay.style.opacity = "0";
    alert_box.style.transform = "translateY(-10px)";
    if (close_function) {
      close_function();
      close_function = null;
    }
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 250);
  }
  
  close_button.onclick = dismiss;
  overlay.onclick = function(e) {
    if (e.target === overlay) dismiss();
  };

  var auto_timer = setTimeout(dismiss, duration);
  close_button.addEventListener("click", function() { clearTimeout(auto_timer); });
}