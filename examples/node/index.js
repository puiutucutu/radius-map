import L from "leaflet";
import "leaflet-draw";
import { RadiusMap } from "radius-map";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw-src.css";
import "tachyons/css/tachyons.min.css";

function makeMap(htmlRef) {
  const tileLayers = {
    osm: L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { id: "osm" }), // prettier-ignore
    cartodbLightAll: L.tileLayer("http://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", { id: "cartodbLightAll" }), // prettier-ignore
    stamenToner: L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", { id: "stamenToner" }), // prettier-ignore
    stamenTonerLite: L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png", { id: "stamenTonerLite" }) // prettier-ignore
  };

  const baseLayers = {
    Coloured: tileLayers.osm,
    Light: tileLayers.cartodbLightAll,
    Dark: tileLayers.stamenTonerLite,
    Darker: tileLayers.stamenToner
  };

  const map = L.map(htmlRef, {
    center: L.latLng(40.7128, -74.006),
    zoom: 12,
    preferCanvas: true,
    renderer: L.canvas()
  });

  const layerControl = L.control.layers(baseLayers, {}, { collapsed: false }); // prettier-ignore
  map.addControl(layerControl);
  map.addLayer(baseLayers.Light); // set default base layer

  return map;
}

const radiusDetailsRef = document.getElementById("radius-details");
const mapHtmlRef = document.getElementById("map");
const map = makeMap(mapHtmlRef);

function onUpdateCallback(layerId, radius, latitude, longitude) {
  radiusDetailsRef.innerText = JSON.stringify({ layerId, radius, latitude, longitude }, null, 1); // prettier-ignore
}

function onErrorCallback(message) {
  console.warn("on error callback:", message);
}

const radiusMapInstance = new RadiusMap(map, onUpdateCallback, onErrorCallback);
radiusMapInstance.drawCircle(1600, 40.75, -73.98);

window.radiusMapInstance = radiusMapInstance;
