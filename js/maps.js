/**
 * SURPLUS-TO-SHELTER LIVE ANIMATED GPS ROUTE MAP MODULE
 * High-Precision Leaflet + OpenStreetMap Interactive Telemetry & Delivery Van Simulation
 * Works 100% Free with OpenStreetMap (Zero Google Maps API costs required)
 */

(function () {
  'use strict';

  // Haversine Distance Helper in Kilometers
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate Navigation Bearing / Heading Angle
  function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x =
      Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    let brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  }

  // Linear Interpolation for Smooth 60fps Vehicle Animation
  function interpolatePoints(p1, p2, steps) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({
        lat: p1.lat + (p2.lat - p1.lat) * t,
        lng: p1.lng + (p2.lng - p1.lng) * t,
        name: p1.name,
        action: p1.action,
        speed: p1.speed + ((p2.speed || p1.speed) - p1.speed) * t
      });
    }
    return pts;
  }

  // Route Waypoints Presets
  const ROUTE_PRESETS = {
    hope_shelter: [
      { lat: 26.9124, lng: 75.7873, name: "Green Leaf Restaurant (C-Scheme)", action: "Pickup Manifest Loaded", speed: 22 },
      { lat: 26.9120, lng: 75.7885, name: "Turning onto Ashok Marg", action: "Heading North-East", speed: 28 },
      { lat: 26.9114, lng: 75.7902, name: "Ashok Marg Corridor", action: "Approaching Roundabout", speed: 36 },
      { lat: 26.9108, lng: 75.7922, name: "Statue Circle Roundabout", action: "Navigating 2nd Exit", speed: 25 },
      { lat: 26.9095, lng: 75.7940, name: "Bhagwan Das Road", action: "Merging onto Arterial", speed: 38 },
      { lat: 26.9080, lng: 75.7958, name: "Panch Batti Intersection", action: "Green Corridor Clear", speed: 42 },
      { lat: 26.9062, lng: 75.7975, name: "MI Road Main Transit Lane", action: "Cruising Speed", speed: 45 },
      { lat: 26.9042, lng: 75.7992, name: "Ajmeri Gate Outer Ring", action: "Bypassing Walled City", speed: 36 },
      { lat: 26.9018, lng: 75.8015, name: "Ram Niwas Garden Avenue", action: "Green Belt Expressway", speed: 40 },
      { lat: 26.8992, lng: 75.8038, name: "Albert Hall Museum Crossing", action: "Entering JLN Marg", speed: 34 },
      { lat: 26.8968, lng: 75.8055, name: "JLN Marg North Corridor", action: "Smooth Flow (45 km/h)", speed: 46 },
      { lat: 26.8942, lng: 75.8072, name: "Rajasthan University Crossing", action: "Ascending Flyover", speed: 42 },
      { lat: 26.8920, lng: 75.8088, name: "Bajaj Nagar Junction", action: "Preparing for Left Turn", speed: 30 },
      { lat: 26.8908, lng: 75.8095, name: "Hope Shelter Access Way", action: "Approaching Gate B Intake", speed: 18 },
      { lat: 26.8900, lng: 75.8100, name: "Hope Shelter (Main Intake Dock)", action: "Arrived at Destination!", speed: 0 }
    ],
    annapurna: [
      { lat: 26.9124, lng: 75.7873, name: "Green Leaf Restaurant (C-Scheme)", action: "Pickup Manifest Loaded", speed: 22 },
      { lat: 26.9108, lng: 75.7922, name: "Statue Circle Roundabout", action: "Crossing Circle", speed: 26 },
      { lat: 26.9062, lng: 75.7975, name: "MI Road", action: "Heading South-East", speed: 40 },
      { lat: 26.8980, lng: 75.8040, name: "JLN Marg Flyover", action: "Express Transit", speed: 48 },
      { lat: 26.8890, lng: 75.8140, name: "Malviya Nagar Ring Road", action: "Bypassing Traffic", speed: 42 },
      { lat: 26.8820, lng: 75.8200, name: "Apex Circle", action: "Turning onto Relief Lane", speed: 30 },
      { lat: 26.8780, lng: 75.8250, name: "Annapurna Relief Hub", action: "Arrived at Annapurna Intake!", speed: 0 }
    ],
    community_care: [
      { lat: 26.9124, lng: 75.7873, name: "Green Leaf Restaurant (C-Scheme)", action: "Pickup Manifest Loaded", speed: 20 },
      { lat: 26.9110, lng: 75.7850, name: "Prithviraj Road West", action: "Heading West Corridor", speed: 32 },
      { lat: 26.9080, lng: 75.7820, name: "Civil Lines Crossing", action: "Passing Transit Node", speed: 36 },
      { lat: 26.9050, lng: 75.7800, name: "Hawa Sadak Boulevard", action: "Approaching Community Hub", speed: 28 },
      { lat: 26.9020, lng: 75.7780, name: "Community Care Mission", action: "Arrived at Mission Center!", speed: 0 }
    ]
  };

  class LiveGpsMapInstance {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
      this.options = options;
      this.map = null;
      this.vanMarker = null;
      this.vanIconElement = null;
      this.donorMarker = null;
      this.ngoMarker = null;
      this.traveledPolyline = null;
      this.remainingPolyline = null;
      this.animInterval = null;
      this.currentFrame = 0;
      this.speedMultiplier = 1;
      this.isPlaying = true;
      this.followVan = true;
      this.destinationKey = options.destination || 'hope_shelter';
      this.routeFrames = [];
      this.totalRouteKm = 0;

      this.init();
    }

    init() {
      if (!this.container) return;
      if (this.container._leaflet_id) {
        // Clear previous Leaflet instance if present
        try {
          this.container._leaflet_id = null;
        } catch (e) {}
      }

      this.buildRouteFrames();
      this.renderMap();
      this.attachHudOverlay();
      this.startLoop();
    }

    buildRouteFrames() {
      const waypoints = ROUTE_PRESETS[this.destinationKey] || ROUTE_PRESETS.hope_shelter;
      const subSteps = 8; // Interpolate 8 frames between each waypoint for fluid motion
      const frames = [];

      for (let i = 0; i < waypoints.length - 1; i++) {
        const sub = interpolatePoints(waypoints[i], waypoints[i + 1], subSteps);
        // Exclude the last item of each sub-segment to prevent duplicates
        frames.push(...sub.slice(0, -1));
      }
      frames.push(waypoints[waypoints.length - 1]);
      this.routeFrames = frames;

      // Calculate total route distance
      let total = 0;
      for (let i = 0; i < frames.length - 1; i++) {
        total += haversineDistance(frames[i].lat, frames[i].lng, frames[i + 1].lat, frames[i + 1].lng);
      }
      this.totalRouteKm = Math.max(total, 2.1);
    }

    renderMap() {
      const startPoint = this.routeFrames[0];
      const endPoint = this.routeFrames[this.routeFrames.length - 1];

      // Initialize Leaflet map
      this.map = L.map(this.container, {
        zoomControl: false,
        attributionControl: false
      }).setView([startPoint.lat, startPoint.lng], 13);

      // Add high-clarity OpenStreetMap Tile Layer (Free, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(this.map);

      // Add Minimalist Zoom Control on bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);

      // 1. Donor Pin (Green Leaf Restaurant)
      const donorHtml = `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(220, 38, 38, 0.25); border-radius: 50%;" class="live-radar-ping"></div>
          <div style="width: 34px; height: 34px; background: #dc2626; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 4px 12px rgba(220,38,38,0.45); border: 2.5px solid #ffffff; z-index: 2;">
            🏪
          </div>
        </div>
      `;
      const donorIcon = L.divIcon({ html: donorHtml, className: '', iconSize: [38, 38], iconAnchor: [19, 19] });
      this.donorMarker = L.marker([startPoint.lat, startPoint.lng], { icon: donorIcon }).addTo(this.map);
      this.donorMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 4px;">
            <span style="color: #dc2626;">🏪</span> Green Leaf Restaurant
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">C-Scheme, Jaipur • Pickup Node</div>
          <div style="display: inline-block; background: #dcfce7; color: #15803d; font-weight: 600; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-top: 5px;">
            ✓ Manifest Loaded (25 kg)
          </div>
        </div>
      `);

      // 2. NGO Shelter Pin (Destination)
      const ngoHtml = `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(37, 99, 235, 0.25); border-radius: 50%;" class="live-radar-ping"></div>
          <div style="width: 34px; height: 34px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 4px 12px rgba(37,99,235,0.45); border: 2.5px solid #ffffff; z-index: 2;">
            🤝
          </div>
        </div>
      `;
      const ngoIcon = L.divIcon({ html: ngoHtml, className: '', iconSize: [38, 38], iconAnchor: [19, 19] });
      this.ngoMarker = L.marker([endPoint.lat, endPoint.lng], { icon: ngoIcon }).addTo(this.map);
      this.ngoMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 4px;">
            <span style="color: #2563eb;">🤝</span> ${endPoint.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Receiving Dock • Handover PIN: 4829</div>
          <div style="display: inline-block; background: #dbeafe; color: #1d4ed8; font-weight: 600; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-top: 5px;">
            Intake Officer: Sarah Jenkins
          </div>
        </div>
      `);

      // 3. Polylines: Traveled (Solid Emerald) and Remaining (Dashed Emerald)
      const fullLatLngs = this.routeFrames.map(f => [f.lat, f.lng]);
      this.remainingPolyline = L.polyline(fullLatLngs, {
        color: '#10b981',
        weight: 5,
        opacity: 0.65,
        dashArray: '8, 8'
      }).addTo(this.map);

      this.traveledPolyline = L.polyline([[startPoint.lat, startPoint.lng]], {
        color: '#047857',
        weight: 6,
        opacity: 0.95
      }).addTo(this.map);

      // 4. Interactive Delivery Van Marker with Pulse Wave & Heading Direction
      const vanHtml = `
        <div class="van-marker-box" style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; inset: -4px; background: rgba(5, 150, 105, 0.35); border-radius: 50%;" class="live-radar-ping"></div>
          <div id="${this.containerId}-van-rotate" style="width: 36px; height: 36px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 14px rgba(4,120,87,0.55); border: 2.5px solid #ffffff; transition: transform 0.25s ease-out; z-index: 3;">
            🚚
          </div>
        </div>
      `;
      const vanIcon = L.divIcon({ html: vanHtml, className: '', iconSize: [44, 44], iconAnchor: [22, 22] });
      this.vanMarker = L.marker([startPoint.lat, startPoint.lng], { icon: vanIcon, zIndexOffset: 1000 }).addTo(this.map);
      this.vanMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: 700; color: #047857; display: flex; align-items: center; gap: 4px;">
            🚚 Courier Rahul (#402)
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Toyota HiAce Thermal Van • EV Active</div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <span style="background: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">Temp: 64°C (Safe)</span>
            <span style="background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">Live GPS</span>
          </div>
        </div>
      `);

      // Fit bounds to entire route initially
      this.map.fitBounds(this.remainingPolyline.getBounds(), { padding: [50, 50] });
    }

    attachHudOverlay() {
      // Find or create map overlay layer container
      const overlay = document.createElement('div');
      overlay.id = `${this.containerId}-hud-overlay`;
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '500';
      overlay.className = 'flex flex-col justify-between p-3 select-none';

      overlay.innerHTML = `
        <!-- TOP HUD: LIVE TELEMETRY BAR -->
        <div class="flex items-start justify-between gap-2 pointer-events-auto">
          <!-- Left: Live Mission Status & Speed Pill -->
          <div class="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-lg border border-slate-700/60 flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400" id="${this.containerId}-hud-status">En Route</span>
            </div>
            <div class="h-3.5 w-px bg-slate-700"></div>
            <div class="text-xs">
              <span class="text-slate-400 font-medium">Speed:</span> 
              <b class="text-slate-100 font-bold ml-1 font-mono" id="${this.containerId}-hud-speed">38 km/h</b>
            </div>
            <div class="h-3.5 w-px bg-slate-700"></div>
            <div class="text-xs">
              <span class="text-slate-400 font-medium">ETA:</span> 
              <b class="text-emerald-300 font-bold ml-1 font-mono" id="${this.containerId}-hud-eta">8 min</b>
            </div>
            <div class="h-3.5 w-px bg-slate-700"></div>
            <div class="text-xs hidden sm:block">
              <span class="text-slate-400 font-medium">Dist:</span> 
              <b class="text-slate-200 font-bold ml-1 font-mono" id="${this.containerId}-hud-dist">2.1 km</b>
            </div>
          </div>

          <!-- Right: Interactive Control Actions -->
          <div class="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-700/60">
            <!-- Play / Pause -->
            <button id="${this.containerId}-btn-playpause" type="button" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors text-xs" title="Pause / Resume Van">
              <span class="material-symbols-outlined text-[18px]">pause</span>
            </button>
            <!-- Speed Multiplier (1x / 2x / 4x) -->
            <button id="${this.containerId}-btn-speed" type="button" class="px-2 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center transition-colors" title="Speed Multiplier">
              1x
            </button>
            <!-- Follow Van Recenter -->
            <button id="${this.containerId}-btn-follow" type="button" class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center transition-colors text-xs" title="Follow Van">
              <span class="material-symbols-outlined text-[18px]">my_location</span>
            </button>
            <!-- Restart Route -->
            <button id="${this.containerId}-btn-restart" type="button" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors text-xs" title="Replay from Pickup">
              <span class="material-symbols-outlined text-[18px]">replay</span>
            </button>
          </div>
        </div>

        <!-- BOTTOM HUD: ACTIVE CORRIDOR & PROGRESS BAR -->
        <div class="pointer-events-auto bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-700/60 max-w-lg">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2 truncate">
              <span class="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">turn_right</span>
              <span class="text-xs font-semibold text-slate-100 truncate" id="${this.containerId}-hud-street">MI Road Main Transit Lane</span>
            </div>
            <span class="text-[11px] font-mono text-emerald-300 font-bold shrink-0" id="${this.containerId}-hud-percent">35% Completed</span>
          </div>
          <!-- Progress Tracker -->
          <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div id="${this.containerId}-hud-progbar" class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300" style="width: 35%;"></div>
          </div>
        </div>
      `;

      this.container.style.position = 'relative';
      this.container.appendChild(overlay);

      // Wire Event Listeners
      const playBtn = document.getElementById(`${this.containerId}-btn-playpause`);
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          this.isPlaying = !this.isPlaying;
          playBtn.innerHTML = this.isPlaying
            ? '<span class="material-symbols-outlined text-[18px]">pause</span>'
            : '<span class="material-symbols-outlined text-[18px]">play_arrow</span>';
          const statusEl = document.getElementById(`${this.containerId}-hud-status`);
          if (statusEl) statusEl.textContent = this.isPlaying ? 'En Route' : 'Simulation Paused';
        });
      }

      const speedBtn = document.getElementById(`${this.containerId}-btn-speed`);
      if (speedBtn) {
        speedBtn.addEventListener('click', () => {
          if (this.speedMultiplier === 1) this.speedMultiplier = 2;
          else if (this.speedMultiplier === 2) this.speedMultiplier = 4;
          else this.speedMultiplier = 1;
          speedBtn.textContent = `${this.speedMultiplier}x`;
        });
      }

      const followBtn = document.getElementById(`${this.containerId}-btn-follow`);
      if (followBtn) {
        followBtn.addEventListener('click', () => {
          this.followVan = !this.followVan;
          if (this.followVan) {
            followBtn.className = 'w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center transition-colors text-xs';
            const cur = this.routeFrames[this.currentFrame];
            if (cur) this.map.panTo([cur.lat, cur.lng]);
          } else {
            followBtn.className = 'w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors text-xs';
          }
        });
      }

      const restartBtn = document.getElementById(`${this.containerId}-btn-restart`);
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.currentFrame = 0;
          this.isPlaying = true;
          if (playBtn) playBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">pause</span>';
        });
      }
    }

    startLoop() {
      if (this.animInterval) clearInterval(this.animInterval);

      // Frame tick every 200ms (modified dynamically by speed multiplier)
      this.animInterval = setInterval(() => {
        if (!this.isPlaying || !this.routeFrames.length) return;

        // Advance frames based on speed multiplier
        this.currentFrame = (this.currentFrame + this.speedMultiplier) % this.routeFrames.length;

        const cur = this.routeFrames[this.currentFrame];
        const nextIdx = Math.min(this.currentFrame + 1, this.routeFrames.length - 1);
        const next = this.routeFrames[nextIdx];

        // 1. Move Van Marker
        this.vanMarker.setLatLng([cur.lat, cur.lng]);

        // 2. Rotate Van Icon towards Heading
        const bearing = calculateBearing(cur.lat, cur.lng, next.lat, next.lng);
        const rotateEl = document.getElementById(`${this.containerId}-van-rotate`);
        if (rotateEl) {
          rotateEl.style.transform = `rotate(${Math.round(bearing)}deg)`;
        }

        // 3. Update Polylines (Traveled vs Remaining)
        const traveledCoords = this.routeFrames.slice(0, this.currentFrame + 1).map(f => [f.lat, f.lng]);
        const remainingCoords = this.routeFrames.slice(this.currentFrame).map(f => [f.lat, f.lng]);
        this.traveledPolyline.setLatLngs(traveledCoords);
        this.remainingPolyline.setLatLngs(remainingCoords);

        // 4. Calculate Distance Remaining
        let remDist = 0;
        for (let i = this.currentFrame; i < this.routeFrames.length - 1; i++) {
          remDist += haversineDistance(
            this.routeFrames[i].lat, this.routeFrames[i].lng,
            this.routeFrames[i + 1].lat, this.routeFrames[i + 1].lng
          );
        }

        // Calculate Dynamic ETA
        const speed = cur.speed || 38;
        const etaMinutes = Math.max(1, Math.round((remDist / Math.max(speed, 20)) * 60));
        const progressPct = Math.round((this.currentFrame / (this.routeFrames.length - 1)) * 100);

        // 5. Update HUD Telemetry
        const speedEl = document.getElementById(`${this.containerId}-hud-speed`);
        if (speedEl) speedEl.textContent = `${Math.round(speed)} km/h`;

        const etaEl = document.getElementById(`${this.containerId}-hud-eta`);
        if (etaEl) etaEl.textContent = progressPct >= 99 ? 'Arrived!' : `${etaMinutes} min`;

        const distEl = document.getElementById(`${this.containerId}-hud-dist`);
        if (distEl) distEl.textContent = `${remDist.toFixed(1)} km`;

        const streetEl = document.getElementById(`${this.containerId}-hud-street`);
        if (streetEl) streetEl.textContent = `${cur.name} • ${cur.action}`;

        const pctEl = document.getElementById(`${this.containerId}-hud-percent`);
        if (pctEl) pctEl.textContent = `${progressPct}% Completed`;

        const progBar = document.getElementById(`${this.containerId}-hud-progbar`);
        if (progBar) progBar.style.width = `${progressPct}%`;

        // 6. Camera Follow Van (if enabled)
        if (this.followVan && this.map) {
          this.map.panTo([cur.lat, cur.lng], { animate: true, duration: 0.2 });
        }

        // Check Arrival
        if (this.currentFrame >= this.routeFrames.length - 1) {
          const statusEl = document.getElementById(`${this.containerId}-hud-status`);
          if (statusEl) statusEl.textContent = 'Mission Arrived';
        }
      }, 200);
    }

    setDestination(destKey) {
      if (!ROUTE_PRESETS[destKey]) return;
      this.destinationKey = destKey;
      this.currentFrame = 0;
      this.buildRouteFrames();

      // Update destination pin position & popup
      const endPoint = this.routeFrames[this.routeFrames.length - 1];
      this.ngoMarker.setLatLng([endPoint.lat, endPoint.lng]);
      this.ngoMarker.setPopupContent(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 4px;">
            <span style="color: #2563eb;">🤝</span> ${endPoint.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Receiving Dock • Handover PIN: 4829</div>
        </div>
      `);

      // Reset remaining polyline
      const fullLatLngs = this.routeFrames.map(f => [f.lat, f.lng]);
      this.remainingPolyline.setLatLngs(fullLatLngs);
      this.map.fitBounds(this.remainingPolyline.getBounds(), { padding: [50, 50] });
    }

    destroy() {
      if (this.animInterval) clearInterval(this.animInterval);
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    }
  }

  // Global Service Registry
  const instances = {};

  const SurplusLiveRouteMap = {
    instances,

    // Initialize Map with Auto-Leaflet Script Loading
    initMap(containerId, options = {}) {
      const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
      if (!container) return null;

      // Ensure Leaflet CSS & JS is loaded
      this.ensureLeafletLoaded(() => {
        // Destroy existing instance on same container if present
        if (instances[containerId]) {
          instances[containerId].destroy();
        }
        const instance = new LiveGpsMapInstance(containerId, options);
        instances[containerId] = instance;
      });
    },

    ensureLeafletLoaded(callback) {
      if (window.L) {
        callback();
        return;
      }

      // Inject CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Inject JS
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => callback();
        document.head.appendChild(script);
      } else {
        const existingScript = document.getElementById('leaflet-js');
        const prevOnload = existingScript.onload;
        existingScript.onload = () => {
          if (prevOnload) prevOnload();
          callback();
        };
      }
    },

    switchDestination(containerId, destKey) {
      if (instances[containerId]) {
        instances[containerId].setDestination(destKey);
      }
    },

    // Backward compatibility with legacy GoogleMapsService methods
    apiKey: localStorage.getItem('GOOGLE_MAPS_API_KEY') || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    setApiKey(key) {
      if (key) {
        this.apiKey = key;
        localStorage.setItem('GOOGLE_MAPS_API_KEY', key);
      }
    },
    renderNativeGoogleMap(container, options) {
      this.initMap(container.id || container, options);
    },
    renderInteractiveMapFallback(container, options) {
      this.initMap(container.id || container, options);
    },
    buildLeafletMap(container, options) {
      this.initMap(container.id || container, options);
    }
  };

  // Expose globally
  window.SurplusLiveRouteMap = SurplusLiveRouteMap;
  window.GoogleMapsService = SurplusLiveRouteMap; // 100% backward compatibility
})();
