<template>
	<apexchart 
		:options="options" 
		:series="series" 
		height="100%" 
		type="bar"
	/>
</template>

<script>
export default {
	name: "Bar",
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
		}	
	},
}
</script>