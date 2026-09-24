/**
 * SURPLUS-TO-SHELTER GOOGLE MAPS LIVE LOCATION & ROUTING MODULE
 * Live Tracking for Driver, Restaurant (Donor), and NGO (Recipient Shelter)
 */

window.GoogleMapsService = {
  apiKey: localStorage.getItem('GOOGLE_MAPS_API_KEY') || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',

  // Preset Jaipur coordinates for demonstration
  locations: {
    restaurant: { name: "Green Leaf Restaurant (Donor)", lat: 26.9124, lng: 75.7873, address: "C-Scheme, Jaipur" },
    driver: { name: "Rahul Sharma (Courier #402)", lat: 26.9050, lng: 75.7950, address: "En Route on MI Road" },
    ngo: { name: "Hope Shelter (Recipient NGO)", lat: 26.8900, lng: 75.8100, address: "JLN Marg, Jaipur" }
  },

  // Set or update API Key dynamically
  setApiKey(key) {
    if (key) {
      this.apiKey = key;
      localStorage.setItem('GOOGLE_MAPS_API_KEY', key);
    }
  },

  // Initialize Map on Container Element
  initMap(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check if Google Maps JS script is already loaded
    if (window.google && window.google.maps && this.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      this.renderNativeGoogleMap(container, options);
    } else {
      // Render interactive Leaflet/Canvas fallback map with Leaflet tiles
      this.renderInteractiveMapFallback(container, options);
    }
  },

  // Native Google Maps API Renderer
  renderNativeGoogleMap(container, options) {
    const center = options.center || { lat: 26.9012, lng: 75.7974 };
    const map = new google.maps.Map(container, {
      zoom: options.zoom || 13,
      center: center,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
      ]
    });

    // Add Markers for Restaurant, Driver, NGO
    new google.maps.Marker({
      position: { lat: this.locations.restaurant.lat, lng: this.locations.restaurant.lng },
      map: map,
      title: "🏪 " + this.locations.restaurant.name,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
    });

    const driverMarker = new google.maps.Marker({
      position: { lat: this.locations.driver.lat, lng: this.locations.driver.lng },
      map: map,
      title: "🚚 " + this.locations.driver.name,
      icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
    });

    new google.maps.Marker({
      position: { lat: this.locations.ngo.lat, lng: this.locations.ngo.lng },
      map: map,
      title: "🤝 " + this.locations.ngo.name,
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });

    // Draw Route Polyline
    const routePath = new google.maps.Polyline({
      path: [
        { lat: this.locations.restaurant.lat, lng: this.locations.restaurant.lng },
        { lat: this.locations.driver.lat, lng: this.locations.driver.lng },
        { lat: this.locations.ngo.lat, lng: this.locations.ngo.lng }
      ],
      geodesic: true,
      strokeColor: "#16803C",
      strokeOpacity: 0.9,
      strokeWeight: 5
    });

    routePath.setMap(map);
  },

  // Interactive OpenStreetMap / Leaflet Fallback (Works even without valid Google key)
  renderInteractiveMapFallback(container, options) {
    // Inject Leaflet CSS & JS if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeafletScript = () => {
      if (window.L) {
        this.buildLeafletMap(container, options);
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => this.buildLeafletMap(container, options);
        document.head.appendChild(script);
      }
    };

    loadLeafletScript();
  },

  buildLeafletMap(container, options) {
    if (!container || container._leaflet_id) return; // Prevent double init

    const map = L.map(container.id || container).setView([26.9012, 75.7974], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© Surplus-To-Shelter Live Telemetry'
    }).addTo(map);

    // Custom Icon Creation
    const createCustomIcon = (emoji, color) => L.divIcon({
      html: `<div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${emoji}</div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // 1. Restaurant Marker
    const restMarker = L.marker([this.locations.restaurant.lat, this.locations.restaurant.lng], {
      icon: createCustomIcon('🏪', '#DC2626')
    }).addTo(map).bindPopup(`<b>${this.locations.restaurant.name}</b><br/>${this.locations.restaurant.address}`);

    // 2. Driver Live Marker (Pulsing)
    const driverMarker = L.marker([this.locations.driver.lat, this.locations.driver.lng], {
      icon: createCustomIcon('🚚', '#16803C')
    }).addTo(map).bindPopup(`<b>${this.locations.driver.name}</b><br/>Status: En Route (12 mins away)`).openPopup();

    // 3. NGO Shelter Marker
    const ngoMarker = L.marker([this.locations.ngo.lat, this.locations.ngo.lng], {
      icon: createCustomIcon('🤝', '#2563EB')
    }).addTo(map).bindPopup(`<b>${this.locations.ngo.name}</b><br/>${this.locations.ngo.address}`);

    // Draw Live Route Line
    const latlngs = [
      [this.locations.restaurant.lat, this.locations.restaurant.lng],
      [this.locations.driver.lat, this.locations.driver.lng],
      [this.locations.ngo.lat, this.locations.ngo.lng]
    ];
    const polyline = L.polyline(latlngs, { color: '#16803C', weight: 4, dashArray: '6, 8' }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Live driver simulation (moves position slightly every 4 seconds)
    setInterval(() => {
      this.locations.driver.lat += 0.0002;
      this.locations.driver.lng += 0.0003;
      driverMarker.setLatLng([this.locations.driver.lat, this.locations.driver.lng]);
    }, 4000);
  }
};
