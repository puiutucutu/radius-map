import { featureGroup, circle } from "leaflet";

/**
 * Extends upon a leaflet map allowing the user to draw a circle.
 *
 * The class implements the following behaviour - the creation of the circle,
 * editing of the circle after it has been created, as well as supplying a
 * callback with the circle's geometric details (e.g., radius, latitude, and
 * longitude) on circle update.
 *
 * Only one circle will be drawn on the map at any one time.
 */
class RadiusMap {
  /* @type {L.Map} */
  map;
  /** @type {number} In meters */
  radiusLimit;
  /* @type {L.Control} */
  layerControl;
  /* @type {number} */
  layerId;
  /* @type {L.featureGroup} */
  editableLayers;

  /**
   * Callback for handling geometry updates.
   *
   * @callback updateCallbackSignature
   * @param {number} layerId
   * @param {number} radius
   * @param {number} latitude
   * @param {number} longitude
   */
  updateCallback;

  /**
   * Callback for handling errors.
   *
   * @callback errorCallbackSignature
   * @param {string} message
   */
  errorCallback;

  /**
   * @param {L.Map} map An Leaflet map instance
   * @param {updateCallbackSignature} updateCallback
   * @param {errorCallbackSignature} errorCallback
   * @param {number} [radiusLimit=5000]] In meters
   */
  constructor(map, updateCallback, errorCallback, radiusLimit = 5000) {
    this.map = map;
    this.updateCallback = updateCallback;
    this.errorCallback = errorCallback;
    this.radiusLimit = radiusLimit;

    // enable drawing
    this.editableLayers = featureGroup();
    this.map.addLayer(this.editableLayers);
    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        circle: true,
        circlemarker: false,
        marker: false,
        polygon: false,
        polyline: false,
        rectangle: false
      },
      edit: {
        featureGroup: this.editableLayers,
        remove: false
      }
    });
    this.map.addControl(drawControl);

    // setup event handlers
    this.handleCreatedEvent();
    this.handleEditStopEvent();
    this.handleEditResize();
  }

  /**
   * @return {string}
   */
  makeDefaultErrorMessage() {
    return `Search radius cannot exceed ${this.radiusLimit / 1000} km`;
  }

  /**
   * Programmatically draw a circle.
   *
   * @param {number} radius
   * @param {number} latitude
   * @param {number} longitude
   * @return {Object}
   */
  drawCircle(radius, latitude, longitude) {
    const circleEntity = circle([latitude, longitude], { radius });
    this.editableLayers.clearLayers();
    this.editableLayers.addLayer(circleEntity);
    const layerId = this.editableLayers.getLayerId(circleEntity);
    const { lat, lng } = circleEntity.getBounds().getCenter(); // object property destructuring

    this.updateCallback(layerId, radius, lat, lng);
  }

  /**
   * Handler for when a shape is created for the first time.
   */
  handleCreatedEvent() {
    this.map.on(L.Draw.Event.CREATED, event => {
      const { layer } = event; // this is a L.circle entity

      this.editableLayers.clearLayers(); // forces leaflet-draw to keep only one shape layer at a time
      this.editableLayers.addLayer(layer);
      this.layerId = this.editableLayers.getLayerId(layer);

      const radius = layer.getRadius();
      const { lat, lng } = layer.getBounds().getCenter(); // object property destructuring

      if (this.isRadiusBelowLimit(radius)) {
        this.updateCallback(this.layerId, radius, lat, lng);
      } else {
        const errorMessage = this.makeDefaultErrorMessage();
        layer.setRadius(this.radiusLimit); // reset radius to allowable limit
        this.updateCallback(this.layerId, this.radiusLimit, lat, lng);
        this.errorCallback(errorMessage);
      }
    });
  }

  handleEditStopEvent() {
    this.map.on(L.Draw.Event.EDITSTOP, event => {
      const editedLayer = this.editableLayers.getLayer(this.layerId); // event does not supply the list of layers

      const radius = editedLayer.getRadius();
      const { lat, lng } = editedLayer.getBounds().getCenter(); // object property destructuring

      if (this.isRadiusBelowLimit(radius)) {
        this.updateCallback(this.layerId, radius, lat, lng);
      } else {
        const errorMessage = this.makeDefaultErrorMessage();
        editedLayer.setRadius(this.radiusLimit); // reset radius to allowable limit
        this.updateCallback(this.layerId, this.radiusLimit, lat, lng);
        this.errorCallback(errorMessage);
      }
    });
  }

  /**
   * Handler for event this occurs when all editing is completed.
   */
  handleEditResize() {
    this.map.on(L.Draw.Event.EDITRESIZE, event => {
      const { layer } = event;
      const { lat, lng } = layer.getBounds().getCenter(); // object property destructuring
      const radius = layer.getRadius();
      this.updateCallback(this.layerId, radius, lat, lng);
    });
  }

  /**
   * @param {number} radius
   * @return {boolean}
   */
  isRadiusBelowLimit(radius) {
    return radius <= this.radiusLimit;
  }

  centerMapOnDrawings() {
    if (this.editableLayers.getLayers().length > 0) {
      this.map.fitBounds(this.editableLayers.getBounds());
    }
  }
}

export { RadiusMap };
