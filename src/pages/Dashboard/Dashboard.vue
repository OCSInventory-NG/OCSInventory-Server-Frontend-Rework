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
		layoutReadyEvent: function(){
			this.layoutLoaded = true
		}
	}
}
</script>
 
