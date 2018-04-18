import { topology, presimplify, simplify, feature } from "topojson"
import { geoPath } from "d3"
import { projection } from "./config"

// CONVERT GEOJSON TO TOPOJSON AFTER SIMPLYIFYING TO OPTIMIZE PERFORMANCE
const convertGeoJSON = (keyname, datasource) => 
    topology({ [keyname]: datasource })
    |> presimplify
    |> simplify
    |> (result => feature(result, result.objects[keyname]))

// RETURN SVG PATH ATTRIBUTES FROM GEOJSON
const getGeoPath = (geoJSON) =>
  geoPath(projection)(geoJSON)

// FETCH JSON HELPER
const fetchJSON = async (url, property) => 
  (await (await fetch(url)).json())[property]

export { convertGeoJSON, getGeoPath, fetchJSON }