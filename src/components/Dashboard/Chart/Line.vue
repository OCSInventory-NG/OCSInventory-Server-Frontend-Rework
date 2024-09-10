<template>
	<div id="line">
		<div class="card donut-card">
			<div class="card-body line-card">
				<h3 class="card-title">
					{{ $t(title) }}
				</h3>
				<apexchart 
					type="line" 
					:options="chartOptions" 
					:series="series"
					height="274.69"
					width="100%"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "LineChart",
	props: {
		options: { type: Object, default: null },
		series: { type: Array, default: null },
		title: { type: String, default: null }
	},
	data() {
		return {
			chartOptions: {
				chart: {
					height: 275,
					type: 'line'
				},
				responsive: [
					{
						breakpoint: 568,
						options: {
							chart: {
								width: 300
							},
							legend: {
								show: false
							}
						}
					}
				]
			}
		}
	},
	async mounted() {
		this.chartOptions.xaxis = this.options["xaxis"]
	}
}
</script>
