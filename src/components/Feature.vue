<template>
  <g :id="name">
    <path :d="features" />
  </g>
</template>

<script>
export default {
  name: "Feature",
  props: ["name", "features"]
}
</script>
