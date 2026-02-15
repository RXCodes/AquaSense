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

// display a stylized alert
function show_alert(message, type = "info", duration = 4000) {
  var overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding-top:70px;opacity:0;transition:opacity 0.25s ease;";

  var accentColor = type == "success" ? "#00FFAE" : type == "error" ? "#FF4D4D" : "#5680FF";
  var iconSymbol = type == "success" ? "\u2713" : type == "error" ? "\u2717" : "\u24D8";

  var alertBox = document.createElement("div");
  alertBox.style.cssText = "width:90%;max-width:480px;background:linear-gradient(180deg,#1E1E1E 0%,rgba(30,30,30,0.95) 100%);border-radius:10px;padding:1.25rem 1.5rem;display:flex;align-items:flex-start;gap:0.75rem;box-shadow:0 10px 30px rgba(0,0,0,0.4);border-left:3px solid " + accentColor + ";transform:translateY(-10px);transition:transform 0.25s ease;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;";

  var icon = document.createElement("span");
  icon.textContent = iconSymbol;
  icon.style.cssText = "color:" + accentColor + ";font-size:1.25rem;flex-shrink:0;line-height:1.4;";

  var text = document.createElement("span");
  text.textContent = message;
  text.style.cssText = "color:#E0E0E0;font-size:0.9375rem;font-weight:400;flex:1;line-height:1.4;";

  var closeBtn = document.createElement("button");
  closeBtn.textContent = "\u2715";
  closeBtn.style.cssText = "background:none;border:none;color:#808080;font-size:1rem;cursor:pointer;flex-shrink:0;padding:0;line-height:1;transition:color 0.15s ease;";
  closeBtn.onmouseenter = function() { closeBtn.style.color = "#FFFFFF"; };
  closeBtn.onmouseleave = function() { closeBtn.style.color = "#808080"; };

  alertBox.appendChild(icon);
  alertBox.appendChild(text);
  alertBox.appendChild(closeBtn);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);

  requestAnimationFrame(function() {
    overlay.style.opacity = "1";
    alertBox.style.transform = "translateY(0)";
  });

  function dismiss() {
    overlay.style.opacity = "0";
    alertBox.style.transform = "translateY(-10px)";
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 250);
  }

  closeBtn.onclick = dismiss;
  overlay.onclick = function(e) {
    if (e.target === overlay) dismiss();
  };

  var autoTimer = setTimeout(dismiss, duration);
  closeBtn.addEventListener("click", function() { clearTimeout(autoTimer); });
}