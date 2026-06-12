// School Bus Tracking System Studio Compiler Logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'backend';
  let compiledCode = {};

  function compileConfigs() {
    const gpsSource = document.getElementById('gps_source').value;
    const backendStack = document.getElementById('backend_stack').value;
    const databaseType = document.getElementById('database_type').value;
    const gateway = document.getElementById('gateway').value;
    const geofenceRadius = document.getElementById('geofence_radius').value;
    const updateInterval = document.getElementById('update_interval').value;
    
    const notifyDepot = document.getElementById('notify_depot').checked;
    const notifyGeofence = document.getElementById('notify_geofence').checked;
    const notifyBoarding = document.getElementById('notify_boarding').checked;

    const optEta = document.getElementById('opt_eta').checked;
    const optRoute = document.getElementById('opt_route').checked;
    const optBehavior = document.getElementById('opt_behavior').checked;
    const optFatigue = document.getElementById('opt_fatigue').checked;

    // Compile Backend Code
    if (backendStack === 'fastapi') {
      compiledCode.backend = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# School Bus Tracking System - Core FastAPI Ingestion Server
# Deployed under MIT Open-Source parameters.

import time
import math
import requests
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="School Bus Ingestion API")

# SRE Config Params
GEOFENCE_RADIUS_METRES = ${geofenceRadius}.0
UPDATE_INTERVAL_SECONDS = ${updateInterval}
GPS_SOURCE = "${gpsSource}"
DATABASE_TYPE = "${databaseType}"
GATEWAY = "${gateway}"

# Mock DB Stores
BUSES: Dict[str, dict] = {}
STOPS: Dict[str, dict] = {
    "stop_1": {
        "name": "Main Street Corner",
        "lat": 12.971598,
        "lng": 77.594562,
        "parents_phone": ["+919876543210"]
    }
}
NOTIFICATIONS_LOG = []

class LocationUpdate(BaseModel):
    bus_id: str
    lat: float
    lng: float
    status: str = "moving"  # moving, idle, depot, sos

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine distance
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c * 1000.0  # meters

def trigger_alerts(bus_id: str, lat: float, lng: float):
    # Geofence monitoring logic
    for stop_id, stop in STOPS.items():
        dist = calculate_distance(lat, lng, stop["lat"], stop["lng"])
        if dist <= GEOFENCE_RADIUS_METRES:
            message = f"🚌 Bus {bus_id} is entering geofence for {stop['name']}. ETA: ~5 mins. Please be ready!"
            
            # Send via selected gateway
            if GATEWAY == "callmebot":
                for phone in stop["parents_phone"]:
                    url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&text={message}&apikey=MOCK_KEY"
                    print(f"[Agentic Trigger] Dispatching WhatsApp alert via CallMeBot: {phone}")
                    # requests.get(url)  # Production async trigger
            
            NOTIFICATIONS_LOG.append({
                "timestamp": time.time(),
                "bus_id": bus_id,
                "stop": stop["name"],
                "message": message,
                "status": "delivered"
            })

@app.post("/api/location")
async def update_location(data: LocationUpdate, background_tasks: BackgroundTasks):
    """
    Ingest GPS coordinates from ${gpsSource === 'smartphone' ? "Driver's Smartphone App" : "Dedicated GT06 Hardware"}.
    """
    BUSES[data.bus_id] = {
        "lat": data.lat,
        "lng": data.lng,
        "last_update": time.time(),
        "status": data.status
    }
    
    if data.status == "sos":
        print("🚨 SOS TRIGGERED! Alerting admin immediately.")
        # Trigger critical PagerDuty or Twilio escalation
        
    ${notifyGeofence ? 'background_tasks.add_task(trigger_alerts, data.bus_id, data.lat, data.lng)' : '# Geofence checking disabled'}
    
    return {"status": "ok", "timestamp": time.time()}

@app.get("/api/logs")
async def get_logs():
    return NOTIFICATIONS_LOG
`;
    } else if (backendStack === 'node') {
      compiledCode.backend = `// School Bus Tracking System - Express & Node.js Ingestion API
// Deployed under MIT Open-Source parameters.

const express = require('express');
const app = express();
app.use(express.json());

const GEOFENCE_RADIUS_METRES = ${geofenceRadius};
const UPDATE_INTERVAL_SECONDS = ${updateInterval};
const GATEWAY = "${gateway}";

const BUSES = {};
const STOPS = {
  "stop_1": {
    name: "Main Street Corner",
    lat: 12.971598,
    lng: 77.594562,
    parents_phone: ["+919876543210"]
  }
};
const NOTIFICATIONS_LOG = [];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

app.post('/api/location', (req, res) => {
  const { bus_id, lat, lng, status } = req.body;
  if (!bus_id || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Missing fields" });
  }

  BUSES[bus_id] = { lat, lng, last_update: Date.now(), status: status || 'moving' };

  // Geofence checks
  ${notifyGeofence ? `
  for (const [stop_id, stop] of Object.entries(STOPS)) {
    const dist = getDistance(lat, lng, stop.lat, stop.lng);
    if (dist <= GEOFENCE_RADIUS_METRES) {
      const msg = \`🚌 Bus \${bus_id} is entering geofence for \${stop.name}. Please be ready!\`;
      
      stop.parents_phone.forEach(phone => {
        console.log(\`[WhatsApp Dispatch] Sending to \${phone} via \${GATEWAY}...\`);
        NOTIFICATIONS_LOG.push({ timestamp: Date.now(), phone, msg, status: 'sent' });
      });
    }
  }
  ` : '// Geofence logic disabled'}

  res.json({ status: "ok" });
});

app.listen(5000, () => console.log('🚌 Node Ingestion Service running on port 5000'));
`;
    } else {
      compiledCode.backend = `// Google Apps Script - Free Tier Real-Time location Ingestion
// Expose as a Web App to process incoming smartphone / device coordinates.

const GEOFENCE_RADIUS_METRES = ${geofenceRadius};
const PHONE_IDS = ["+919876543210"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Live_Location");
    
    // Append row: Timestamp, Bus ID, Latitude, Longitude, Status
    sheet.appendRow([new Date(), data.bus_id, data.lat, data.lng, data.status]);
    
    // Geofence evaluation (Mock using Haversine calculation on Sheet values)
    // Send alerts usingUrlFetchApp.fetch() to WhatsApp webhooks / CallMeBot API.
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
    }

    // Compile DB schema or Setup configuration
    if (databaseType === 'postgresql') {
      compiledCode.db_setup = `-- PostgreSQL + PostGIS Schema Setup
-- Optimized for School Bus Tracking Geofencing

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Buses Table
CREATE TABLE IF NOT EXISTS buses (
  bus_id VARCHAR(50) PRIMARY KEY,
  route_id VARCHAR(50),
  current_location GEOMETRY(Point, 4326),
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'moving' -- moving, idle, depot, sos
);

-- 2. Routes Table
CREATE TABLE IF NOT EXISTS routes (
  route_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  stop_sequence JSONB -- Sequence list of stop IDs
);

-- 3. Stops Table with Spatial Geometry
CREATE TABLE IF NOT EXISTS stops (
  stop_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  parents_phone JSONB -- List of parent numbers associated
);

-- 4. Spatial Indexing for rapid geofencing evaluations
CREATE INDEX IF NOT EXISTS idx_stops_location ON stops USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_buses_location ON buses USING GIST(current_location);

-- Helper geofence lookup query
-- Finds buses currently within X meters of any stop
-- SELECT s.name, b.bus_id 
-- FROM stops s, buses b 
-- WHERE ST_DWithin(s.location::geography, b.current_location::geography, ${geofenceRadius});
`;
    } else {
      compiledCode.db_setup = `// Google Sheets Database Prototyping setup
// Paste this code inside Extensions -> Apps Script on your Google Sheets container.

function setupSheetDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create Live_Location sheet
  let liveSheet = ss.getSheetByName("Live_Location");
  if (!liveSheet) {
    liveSheet = ss.insertSheet("Live_Location");
    liveSheet.appendRow(["Timestamp", "Bus ID", "Latitude", "Longitude", "Status"]);
  }

  // 2. Create Stops sheet
  let stopsSheet = ss.getSheetByName("Stops");
  if (!stopsSheet) {
    stopsSheet = ss.insertSheet("Stops");
    stopsSheet.appendRow(["Stop ID", "Stop Name", "Latitude", "Longitude", "Parents Phone Numbers"]);
    stopsSheet.appendRow(["stop_1", "Main Street Corner", 12.971598, 77.594562, "+919876543210, +919876543211"]);
  }
  
  Logger.log("✅ School Bus database sheets successfully initialized.");
}
`;
    }

    // Compile Parent PWA HTML (Leaflet Maps)
    compiledCode.parent_pwa = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BusTrack - Parent View Portal</title>
  
  <!-- Leaflet.js Mapping CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  
  <style>
    body { font-family: -apple-system, sans-serif; margin: 0; background: #f8fafc; }
    .header { padding: 16px; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: space-between; }
    .status-card { margin: 16px; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    #map { height: 350px; margin: 0 16px 16px 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .badge { background: #e0e7ff; color: #4f46e5; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>

  <div class="header">
    <h3 style="margin: 0;">🚌 BusTrack Live</h3>
    <span class="badge">Route 4-B</span>
  </div>

  <div class="status-card">
    <div style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Next Destination</div>
    <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;" id="next-stop">Main Street Corner</div>
    <div style="font-size: 14px; color: #4f46e5; font-weight: bold; margin-top: 6px;" id="eta-value">ETA: Calculating...</div>
  </div>

  <div id="map"></div>

  <script>
    // Initialize map centered on Indian tech region or default geolocation
    const map = L.map('map').setView([12.971598, 77.594562], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Stop marker
    const stopIcon = L.divIcon({ html: '🚏', className: 'stop-marker', iconSize: [24, 24] });
    L.marker([12.971598, 77.594562], { icon: stopIcon }).addTo(map).bindPopup("Main Street Corner (Stop)");

    // Bus marker
    const busIcon = L.divIcon({ html: '🚌', className: 'bus-marker', iconSize: [32, 32] });
    const busMarker = L.marker([12.965, 77.585], { icon: busIcon }).addTo(map).bindPopup("Live Bus Coordinates");

    // Pull real-time coordinates every 5 seconds
    function fetchLiveCoordinates() {
      // In production: fetch('/api/location/live')
      // For demo: simulation drift
      const latOffset = (Math.random() - 0.5) * 0.001;
      const lngOffset = (Math.random() - 0.5) * 0.001;
      const newLat = 12.971598 + latOffset;
      const newLng = 77.594562 + lngOffset;

      busMarker.setLatLng([newLat, newLng]);
      map.panTo([newLat, newLng]);
      
      const eta = Math.ceil(Math.abs(latOffset) * 1000 + 2);
      document.getElementById('eta-value').textContent = "ETA: " + eta + " mins";
    }

    setInterval(fetchLiveCoordinates, ${updateInterval * 1000});
  </script>
</body>
</html>
`;

    // Compile Driver Dashboard
    compiledCode.driver_app = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Driver Transit Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #1e293b; color: white; margin: 0; padding: 20px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
    .btn { width: 100%; padding: 25px; font-size: 20px; font-weight: bold; border: none; border-radius: 16px; cursor: pointer; transition: transform 0.1s; margin-bottom: 15px; }
    .btn:active { transform: scale(0.98); }
    .btn-start { background: #10b981; color: white; }
    .btn-stop { background: #ef4444; color: white; }
    .btn-sos { background: #dc2626; color: white; flex: 1; margin-top: auto; font-size: 28px; box-shadow: 0 8px 16px rgba(220, 38, 38, 0.4); }
    .status-panel { background: #334155; padding: 15px; border-radius: 12px; text-align: center; font-size: 14px; margin-bottom: 20px; }
  </style>
</head>
<body>

  <div class="status-panel">
    <div>DEVICE SIMULATION: <strong style="color:#10b981">${gpsSource.toUpperCase()} ACTIVE</strong></div>
    <div style="margin-top:5px; font-size:12px; color:#94a3b8">Update Interval: ${updateInterval}s | Geofence: ${geofenceRadius}m</div>
  </div>

  <button class="btn btn-start" onclick="toggleTrip(this)">🟢 START TRIP</button>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
    <button class="btn" style="background:#eab308; color:black; font-size:15px; padding:15px;" onclick="logBoarding('boarded')">Child Boarded</button>
    <button class="btn" style="background:#3b82f6; color:white; font-size:15px; padding:15px;" onclick="logBoarding('dropped')">Child Dropped</button>
  </div>

  <button class="btn btn-sos" onclick="triggerSOS()">🚨 EMERGENCY SOS</button>

  <script>
    let tripInterval = null;
    let isTripActive = false;

    function toggleTrip(btn) {
      isTripActive = !isTripActive;
      if (isTripActive) {
        btn.textContent = "🛑 STOP TRIP";
        btn.className = "btn btn-stop";
        startGpsTracking();
      } else {
        btn.textContent = "🟢 START TRIP";
        btn.className = "btn btn-start";
        stopGpsTracking();
      }
    }

    function startGpsTracking() {
      console.log("GPS Location acquisition thread started.");
      tripInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(position => {
          const payload = {
            bus_id: "bus_route_4b",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            status: "moving"
          };
          // Post coordinates to backend API
          fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(e => console.log("Network buffer sync pending..."));
        });
      }, ${updateInterval * 1000});
    }

    function stopGpsTracking() {
      if (tripInterval) clearInterval(tripInterval);
      console.log("GPS Location acquisition thread terminated.");
    }

    function logBoarding(status) {
      alert("Child " + status.toUpperCase() + " logged. Parents notified via WhatsApp webhook.");
    }

    function triggerSOS() {
      const confirmSos = confirm("Warning: Trigger emergency notifications to all parents?");
      if (confirmSos) {
        fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bus_id: "bus_route_4b", lat: 12.971, lng: 77.594, status: "sos" })
        });
      }
    }
  </script>
</body>
</html>
`;

    // Compile Admin Dashboard HTML
    compiledCode.admin = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Fleet Monitor</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: white; margin: 0; padding: 20px; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .panel { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #334155; font-size: 13px; }
    th { color: #94a3b8; text-transform: uppercase; font-size: 11px; }
    .badge-live { background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <h2>🚌 Fleet Administration Command Control</h2>
  <div class="grid">
    <div class="panel">
      <h3>Active Bus Dispatch Routes</h3>
      <table>
        <thead>
          <tr>
            <th>Bus ID</th>
            <th>Active Route</th>
            <th>Last Location</th>
            <th>Sync Latency</th>
            <th>Telemetry Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>BUS-4B</td>
            <td>Main Depot ➔ School Hub</td>
            <td>12.9715, 77.5945</td>
            <td>2s ago</td>
            <td><span class="badge-live">ONLINE</span></td>
          </tr>
          <tr>
            <td>BUS-9A</td>
            <td>North Ring Road</td>
            <td>12.9840, 77.6120</td>
            <td>5s ago</td>
            <td><span class="badge-live">ONLINE</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="panel">
      <h3>Alert Webhook Dispatch Logs</h3>
      <div style="font-family: monospace; font-size: 11px; height: 250px; overflow-y: scroll; color: #34d399; background: #020617; padding: 10px; border-radius: 6px;" id="alerts-console">
        [17:10:05] [INFO] Geofence checked stops.
        [17:10:10] [ALERT] Bus BUS-4B entered Main Street geofence.
        [17:10:11] [DISPATCH] Sent 2 WhatsApp SMS via CallMeBot.
        [17:10:35] [INFO] Bus ping received.
      </div>
    </div>
  </div>
</body>
</html>
`;

    // Compile Flow diagram
    compiledCode.flow_diagram = `graph TD
  Driver[${gpsSource === 'smartphone' ? "Smartphone GPS (Update 5s)" : "GT06 GPS Tracker"}] -->|JSON coordinates| API[Backend API: ${backendStack.toUpperCase()}]
  API -->|Save location| DB[${databaseType === 'postgresql' ? "Postgres + PostGIS" : "Google Sheets"}]
  
  DB -->|Query Geofence| Agent[ETA & Geofence Agent]
  Agent -->|Radius: ${geofenceRadius}m| Geofence{Trigger?}
  
  Geofence -->|Yes| Bot[Gateway: ${gateway.toUpperCase()}]
  Bot -->|WhatsApp Notification| Parents[WhatsApp Alert to Parents]
  
  API -->|Live JSON feed| PWA[Parent PWA Map Viewport]
  API -->|Live Fleet details| Admin[Admin Command Dashboard]
  
  ${optEta ? 'Agent -->|Fetch travel times| MapAPI[Google Maps API]' : ''}
  ${optRoute ? 'Agent -->|Compute sequence| RLRoute[AI Route Optimiser]' : ''}
`;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'flow_diagram') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .w-full, .custom-checkbox');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Interactive Simulation Loop
  const btnRunSim = document.getElementById('btn_run_sim');
  const simBus = document.getElementById('sim-bus');
  const simSpeed = document.getElementById('sim-speed');
  const simDistance = document.getElementById('sim-distance');
  const simChatContainer = document.getElementById('sim-chat-container');
  const simTelemetry = document.getElementById('sim-telemetry');

  const nodes = {
    'node-depot': document.getElementById('node-depot'),
    'node-stop-a': document.getElementById('node-stop-a'),
    'node-stop-b': document.getElementById('node-stop-b'),
    'node-school': document.getElementById('node-school'),
  };

  let simTimer = null;
  let isSimActive = false;

  if (btnRunSim) {
    btnRunSim.onclick = () => {
      if (isSimActive) return;
      isSimActive = true;
      btnRunSim.disabled = true;
      btnRunSim.textContent = "Simulation Running...";
      btnRunSim.classList.replace('bg-indigo-600', 'bg-slate-700');

      // Reset DOM elements
      if (simTelemetry) simTelemetry.textContent = "";
      if (simChatContainer) {
        simChatContainer.innerHTML = '<div class="text-[8px] text-slate-500 text-center font-mono py-1">🔒 Messages and calls are end-to-end encrypted.</div>';
      }
      Object.values(nodes).forEach(n => {
        if (n) {
          n.classList.remove('text-indigo-400', 'scale-125');
          n.classList.add('text-slate-500');
        }
      });

      const radius = document.getElementById('geofence_radius').value;
      const steps = [
        {
          left: '20px',
          speed: '35 km/h',
          distance: '0m',
          log: '[Ingest] Bus BUS-4B initialization sequence complete. Engine ON. Status: moving',
          whatsapp: '🚌 Depot Alert: Bus BUS-4B has departed the school depot on Route 4-B.',
          activeNode: 'node-depot'
        },
        {
          left: '16%',
          speed: '42 km/h',
          distance: '450m',
          log: '[Ingest] Driver telemetry ping: lat=12.968431, lng=77.588210 (Status: moving)',
          activeNode: null
        },
        {
          left: 'calc(33% - 12px)',
          speed: '12 km/h',
          distance: '950m',
          log: `[Geofence] Stop A breached (Radius: ${radius}m). Target distance: 85m. Dispatching alerts.`,
          whatsapp: `🚌 Arrival Alert: Bus BUS-4B is entering the geofence for Stop A. Estimated arrival in 2 minutes. Please be ready!`,
          activeNode: 'node-stop-a'
        },
        {
          left: 'calc(33% - 12px)',
          speed: '0 km/h',
          distance: '1000m',
          log: '[Boarding] Driver logged child boarding tap at Stop A. Sending parent notifications...',
          whatsapp: '✅ Boarding Confirmed: Your child has boarded Bus BUS-4B at Stop A.',
          activeNode: 'node-stop-a'
        },
        {
          left: '50%',
          speed: '45 km/h',
          distance: '1500m',
          log: '[Ingest] Driver telemetry ping: lat=12.973510, lng=77.601243 (Status: moving)',
          activeNode: null
        },
        {
          left: 'calc(66% - 12px)',
          speed: '15 km/h',
          distance: '2000m',
          log: `[Geofence] Stop B breached (Radius: ${radius}m). Target distance: 110m. Dispatching alerts.`,
          whatsapp: `🚌 Arrival Alert: Bus BUS-4B is entering the geofence for Stop B. Estimated arrival in 3 minutes. Please be ready!`,
          activeNode: 'node-stop-b'
        },
        {
          left: '83%',
          speed: '38 km/h',
          distance: '2500m',
          log: '[Ingest] Driver telemetry ping: lat=12.978210, lng=77.608122 (Status: moving)',
          activeNode: null
        },
        {
          left: 'calc(100% - 40px)',
          speed: '0 km/h',
          distance: '3100m',
          log: '[Ingest] School coordinates match. Route completed successfully. Transiting to depot state.',
          whatsapp: '🏫 School Arrival: Bus BUS-4B has arrived safely at school hub. Trip completed.',
          activeNode: 'node-school'
        }
      ];

      let currentStep = 0;
      function runNextStep() {
        if (currentStep >= steps.length) {
          isSimActive = false;
          btnRunSim.disabled = false;
          btnRunSim.textContent = "Start Route Simulation";
          btnRunSim.classList.replace('bg-slate-700', 'bg-indigo-600');
          return;
        }

        const step = steps[currentStep];

        // Update bus avatar
        if (simBus) simBus.style.left = step.left;
        if (simSpeed) simSpeed.textContent = `Velocity: ${step.speed}`;
        if (simDistance) simDistance.textContent = `Distance: ${step.distance}`;

        // Highlight nodes
        if (step.activeNode) {
          Object.entries(nodes).forEach(([key, n]) => {
            if (n) {
              if (key === step.activeNode) {
                n.classList.remove('text-slate-500');
                n.classList.add('text-indigo-400', 'scale-125');
              } else {
                n.classList.remove('scale-125');
              }
            }
          });
        }

        // Output telemetry logs
        if (simTelemetry) {
          simTelemetry.textContent += `[${new Date().toLocaleTimeString()}] ${step.log}\n`;
          simTelemetry.scrollTop = simTelemetry.scrollHeight;
        }

        // WhatsApp message dispatch
        if (step.whatsapp && simChatContainer) {
          const bubble = document.createElement('div');
          bubble.style.cssText = "align-self: flex-end; background: #056162; color: white; padding: 6.5px 10px; border-radius: 8px 8px 0 8px; max-width: 80%; font-size: 10px; line-height: 1.35; box-shadow: 0 1px 1px rgba(0,0,0,0.1); word-wrap: break-word; font-family: sans-serif;";
          bubble.innerHTML = `<div>${step.whatsapp}</div><div style="text-align: right; font-size: 8px; color: #a5d6a7; margin-top: 2px;">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
          simChatContainer.appendChild(bubble);
          simChatContainer.scrollTop = simChatContainer.scrollHeight;
        }

        currentStep++;
        simTimer = setTimeout(runNextStep, 2500);
      }

      runNextStep();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['backend', 'db_setup', 'parent_pwa', 'driver_app', 'admin', 'flow_diagram', 'simulator'],
    'backend',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      let name = 'bus_tracker.py';
      
      const stack = document.getElementById('backend_stack').value;
      if (tabName === 'backend') {
        name = stack === 'fastapi' || stack === 'google_apps_script' ? 'bus_tracker.py' : 'server.js';
      }
      if (tabName === 'db_setup') {
        const dbType = document.getElementById('database_type').value;
        name = dbType === 'postgresql' ? 'schema.sql' : 'sheets_setup.js';
      }
      if (tabName === 'parent_pwa') name = 'parent_pwa.html';
      if (tabName === 'driver_app') name = 'driver_app.html';
      if (tabName === 'admin') name = 'admin_dashboard.html';
      if (tabName === 'flow_diagram') name = 'flowchart.txt';
      if (tabName === 'simulator') name = 'simulation.log';
      
      elements.downloadInput.value = name;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
