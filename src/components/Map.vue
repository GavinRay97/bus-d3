<template>
  <svg id="map" ref="map">
    <Feature
      v-for="({path}, key, index) in features"
      :name="key"
      :features="path"
      :key="index"
      :ref="key" />
    <Buses :buses="buses" ref="buses" />
  </svg>
</template>

<script>
import Feature from "./Feature"
import Buses from "./Buses"

import { features, enableZoom } from "../config"
import { fetchJSON, getGeoPath } from "../utils"

export default {
  name: "Map",
  components: {
    Feature,
    Buses
  },
  data() {
    return {
      buses: [],
      routes: [],
      features
    }
  },
  methods: {
    // RENDER BUS LOCATIONS TO MAP
    async drawBuses() {
      const routeURL =
        "http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=sf-muni"
      const vehicleLocationURL =
        "http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni"

      const routes = await fetchJSON(routeURL, "route")
      const buses = await fetchJSON(vehicleLocationURL, "vehicle")

      this.routes = routes.map(({ tag }) => ({ tag }))
      this.buses = buses.map(({ routeTag, lat, lon }) => ({ routeTag, lat, lon }))
    },
    // GENERATE SVG PATH DATA FROM EACH FEATURE'S GEOJSON DATA
    async loadFeatures() {
      // ITERATE THOUGH THIS.FEATURES, PASSING THE NAME OF THE FEATURE AND IT'S GEOJSON DATA
      // THE PATH KEY IS SET ON THE FEATURE WITH THE RESULT OF CALLING geoPath ON THE DATAA
      Object.entries(this.features).forEach(([name, {geoJSON}]) => {
        this.features[name].path = getGeoPath(geoJSON)
      })
    },
    // SET UP THE MAP BY LOADING FEATURES, DRAWING BUSES, AND ENABLING PAN AND ZOOM
    async setupMap() {
      this.loadFeatures()
      this.drawBuses()
      enableZoom(this.$refs)
    }
  },
  mounted() {
    this.setupMap()
  }
}
</script>

<style lang="scss">
#map {
  width: 100vw;
  height: 100vh;
}

#streets {
  stroke: dodgerblue;
  fill: green;
}

#neighborhoods {
  fill: green;
}

#freeways {
  stroke: darkblue;
  fill: green;
}

#arteries {
  stroke: indigo;
  fill: green;
}

.buses {
  r: 3;
  fill: tomato;
}
</style>