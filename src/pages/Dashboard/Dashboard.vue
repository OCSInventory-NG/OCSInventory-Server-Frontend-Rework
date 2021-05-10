<template>
	<grid-layout
		:layout.sync="layout"
		:col-num="12"
		:row-height="100"
		:is-draggable="true"
		:is-resizable="true"
		:is-mirrored="false"
		:vertical-compact="true"
		:margin="[10, 10]"
		:use-css-transforms="true"
		@layout-ready="layoutReadyEvent"
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
			<template v-if="layoutLoaded">
				<Chart/>
			</template>
        </grid-item>
    </grid-layout>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import Chart from '@/components/Charts/Chart';

export default {
	name: "Dashboard",
	components: {
		GridLayout: VueGridLayout.GridLayout,
		GridItem: VueGridLayout.GridItem,
		Chart
    },
	data() {
		return {
			layout: [
				{"x":0,"y":0,"w":3,"h":3,"i":"0"},
			],
			layoutLoaded: false,
		}	
	},
	methods: {
		layoutReadyEvent: function(newLayout){
			this.layoutLoaded = true
		}
	}
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
	background-color: white;
}

.vue-grid-item.vue-grid-placeholder {
    background: grey;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
}  
</style>
 
