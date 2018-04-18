import { geoAlbers, zoom, select, event } from "d3"
import { convertGeoJSON } from "./utils"

import streetsGeoJSON from "./sfmaps/streets.json"
import neighborhoodsGeoJSON from "./sfmaps/neighborhoods.json"
import arteriesGeoJSON from "./sfmaps/arteries.json"
import freewaysGeoJSON from "./sfmaps/freeways.json"


// CONFIGURE MAP SCALE, LONGITUDE, AND LATITUDE
const _mapConfig = {
  scale: 350000,
  longitude: 37.7749,
  latitude: 122.4194,
}

// GENERATE FEATURES OBJECT TO PASS TO VUE MAP COMPONENT DATA
const _featuresTuple = [
  ["neighborhoods", neighborhoodsGeoJSON],
  ["streets", streetsGeoJSON],
  ["freeways", freewaysGeoJSON],
  ["arteries", arteriesGeoJSON]
]

const features = _featuresTuple.reduce((acc, [name, geoJSON = convertGeoJSON(name, geoJSON), path = false]) => {
  const feature = {
    [name]: {
      geoJSON,
      path
    }
  }
  return {...acc, ...feature}
}, {})

//  RETURNS -
//   features: {
//     [feature name]: {
//       file: [GeoJSON file],
//       data: [GeoJSON features],
//     },
//   }


// CREATE THE ALBERS PROJECTION MAP TO EXPORT
const projection = geoAlbers()
  .scale(_mapConfig.scale)
  .rotate([_mapConfig.latitude, 0])
  .center([0, _mapConfig.longitude])

// FUNCTION TO CALL ON EACH ELEMENT WHEN MAP ZOOM TRIGGERED
const zoomTransformFn = (element) => {
  const { transform } = event
  const { x, y, k } = transform
  const transformFn = el => {
    el.style.strokeWidth = 1.5 / transform.k + "px"
    el.style.transform = `translate(${x}px, ${y}px) scale(${k})`
  }
  return transformFn(element)
}

// CONFIGURE THE ABILITY TO ZOOM ON EACH REF ELEMENT
const _configureZoom = (refElements) => {
  const zoomFn = () => {
    return Object.keys(refElements).forEach(el => {
      const element = refElements[el][0]
        ? refElements[el][0].$el
        : refElements[el].$el
      element && zoomTransformFn(element)
    })
  }
  return zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomFn)
}

// ENABLE THE ABILITY TO ZOOM
const enableZoom = (refElements) =>
  select(refElements.map).call(_configureZoom(refElements))

export {
  features,
  projection,
  enableZoom,
  zoomTransformFn
}