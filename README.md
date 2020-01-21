# radius-map

Preconfigured `leaflet` map using a circle from `leaflet-draw` for implementing a within radius search on a map.
 
![screenshot](screenshots/screenshot.png)

## Docs

* https://puiutucutu.github.io/radius-map/

## Features

* programatically draw a circle
* hooks for on draw and on draw error callbacks
* does not bundle `leaflet` or `leaflet-draw` dependencies making for a light build

## Use

### Browser

Import `radius-map.umd.js` and access it via the `radiusMap` window global.

Since `leaflet` and `leaflet-draw` are dependencies, they must be loaded before `rm` so that the globals `L` and `L.draw` exist in the browser's namespace.

See an example at `./examples/browser/index.html`.

### Node

Only one export is provided via `./dist/radius-map.ejs.js`.  

See `./examples/node` for a standalone example.

#### Install

```
npm install radius-map
```

#### Importing and Usage

Similar to the `umd` build, the `ejs` build requires `leaflet` and `leaflet-draw` to be imported seperately.

After importing `radius-map`, your bundling tool is responsible for bundling the `leaflet` and `leaflet-draw` dependencies.

### Development

```
npm run start
```

Outputs a bundled build in the `./development/dist` folder and serves the `./development/index.html` file locally. 
