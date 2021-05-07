<template>
	<grid-layout
		:layout.sync="layout"
		:col-num="12"
		:row-height="30"
		:is-draggable="true"
		:is-resizable="true"
		:is-mirrored="false"
		:vertical-compact="true"
		:margin="[10, 10]"
		:use-css-transforms="true"
    >
        <grid-item 
			v-for="item in layout"
			:x="item.x"
			:y="item.y"
			:w="item.w"
			:h="item.h"
			:i="item.i"
			:key="item.i"
		>
			<apexchart height="100%" type="bar" :options="options" :series="series"></apexchart>
        </grid-item>
    </grid-layout>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';

export default {
	name: "Dashboard",
	components: {
		GridLayout: VueGridLayout.GridLayout,
		GridItem: VueGridLayout.GridItem
    },
	data() {
		return {
			options: {
				chart: {
					id: 'vuechart-example',
					type: 'bar',
					redrawOnParentResize: true,
					height: '100%'
				},
				xaxis: {
					categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
				}
			},
			series: [{
				name: '0',
				data: [30, 40, 45, 50, 49, 60, 70, 91]
			}],
			layout: [
				{"x":0,"y":0,"w":3,"h":8,"i":"0"},
			],
		}	
	},
}
</script>

<style lang="scss">
.vue-grid-item {
	-webkit-box-shadow: 0 0 4px #b6b5b5;
    box-shadow: 0 0 4px #b6b5b5;
    font-size: 10pt;
    display: grid;
    grid-template-rows: 64px auto auto;
    padding: 5px;
}
</style>
 
