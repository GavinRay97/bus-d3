<template>
  <g id="buses">
    <circle class="buses" v-for="(bus, index) in buses" :style="{transform: getBusTransformText(bus)}" :key="index" />
  </g>
</template>

<script>
import { projection } from "../config"
export default {
  name: "Buses",
  props: ["buses", "projection"],
  methods: {
    getBusTransformText(bus) {
      return `translate(${String(projection([bus.lon, bus.lat]))
        .split(",")
        .join("px,")}px)`
    }
  }
}
</script>
