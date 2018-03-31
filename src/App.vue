<template>
  <div id="app">
    <div id="menu">
      <span id="menu-title">Enable Routes:</span>
      <div class="route-check-wrapper" v-for="(route, index) in routes" :key="index">
        <input type="checkbox" id="checkbox" v-model="route.enabled" />
        <label for="checkbox">{{ route.tag }}</label>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { geoPath, geoAlbers } from "d3-geo";
import streetData from "./sfmaps/streets.json";

const CONFIG = {
  MAP_SCALE: 500000,
  MAP_WIDTH: "75vw",
  MAP_HEIGHT: "100vh",
  MAP_LONGITUDE: 37.7749,
  MAP_LATITUDE: 122.4194,
  ZOOM_MIN_SCALE: 1,
  ZOOM_MAX_SCALE: 8,
  STREET_FILTER_DEGREE: 4,
  STREET_COLOR: "dodgerblue",
  LABEL_COLOR: "black",
  LABEL_FONT_SIZE: 2,
  BUS_COLOR: "tomato",
  BUZ_MARKER_SIZE: 3
};

export default {
  name: "app",
  data() {
    return {
      routes: []
    };
  },
  computed: {
    enabledRoutes() {
      return this.routes.filter(({ enabled }) => enabled).map(({ tag }) => tag);
    }
  },
  mounted() {
    // Only display one out of every (n) street entries for render performance
    const streetsCompact = streetData.features.filter(
      (_, index) => index % CONFIG.STREET_FILTER_DEGREE == 0
    );

    // Generate placeholder elements for rendering
    const svg = d3
      .select("#app")
      .append("svg")
      .attr("width", CONFIG.MAP_WIDTH)
      .attr("height", CONFIG.MAP_HEIGHT);
    const streets = svg.append("g");
    const labels = svg.append("g").attr("class", "label");
    const buses = svg.append("g").attr("class", "bus");

    // Map zoom function
    const zoom = d3
      .zoom()
      .scaleExtent([CONFIG.ZOOM_MIN_SCALE, CONFIG.ZOOM_MAX_SCALE])
      .on("zoom", zoomed);

    // Scale each drawn element type on zoom
    function zoomed() {
      streets.style("stroke-width", 1.5 / d3.event.transform.k + "px");
      streets.attr("transform", d3.event.transform);
      labels.style("stroke-width", 1.5 / d3.event.transform.k + "px");
      labels.attr("transform", d3.event.transform);
      buses.style("stroke-width", 1.5 / d3.event.transform.k + "px");
      buses.attr("transform", d3.event.transform);
    }

    // Use D3 Albers type projection for map
    const projection = geoAlbers()
      .scale(CONFIG.MAP_SCALE)
      .rotate([CONFIG.MAP_LATITUDE, 0])
      .center([0, CONFIG.MAP_LONGITUDE])
      .translate([490, 250]);

    // Set up D3 geo-path with Albers projection
    const path = geoPath(projection);

    // Call zoom method to enable on render
    svg.call(zoom);

    // Render streets
    streets
      .append("path")
      .datum(streetData)
      .attr("fill", "dodgerblue")
      .attr("d", path);

    // Render labels
    labels
      .selectAll(".label")
      .data(streetsCompact)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("font-size", CONFIG.LABEL_FONT_SIZE)
      .attr("color", CONFIG.LABEL_COLOR)
      .attr("transform", feature => "translate(" + path.centroid(feature) + ")")
      .style("text-anchor", "middle")
      .text(feature => feature.properties.STREET);

    const routeURL =
      "http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=sf-muni";
    const vehicleLocationURL =
      "http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni";

    const getBusRoutes = async () => {
      const req = await fetch(routeURL);
      const res = await req.json();
      return res.route.map(({ tag }) => {
        return { tag, enabled: false };
      });
    };

    const getRouteData = async routeTag => {
      const req = await fetch(vehicleLocationURL);
      const res = await req.json();
      return res.vehicle.map(({ routeTag, lat, lon }) => {
        return { routeTag, lat, lon };
      });
    };

    getBusRoutes().then(routes => (this.routes = routes));

    const drawBuses = () =>
      // Filter non-active route lines
      getRouteData().then(busLocations => {
        const enabledBuses = busLocations.filter(bus =>
          this.enabledRoutes.includes(bus.routeTag)
        );

        // Render buses
        buses
          .selectAll(".bus")
          .data(enabledBuses)
          .enter()
          .append("circle")
          .attr("class", "bus")
          .attr("r", CONFIG.BUZ_MARKER_SIZE)
          .attr("fill", CONFIG.BUS_COLOR)
          .attr(
            "transform",
            bus => `translate(${projection([bus.lon, bus.lat])})`
          );
      });

    setInterval(drawBuses, 15000);
  }
};
</script>

<style lang="scss">
#menu {
  width: 20vw;
  height: 100vh;
  background-color: grey;
  float: left;
}

#menu-title {
  float: left;
}

.route-check-wrapper {
  float: left;
}
</style>
