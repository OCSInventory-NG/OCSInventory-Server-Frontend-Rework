<template>
	<div id="bar">
		<div class="card donut-card">
			<b-button 
				v-if="edit"
				size="sm" 
				variant="outline-danger" 
				@click="removeItem()"
			>
				<font-awesome-icon 
					:icon="['fas', 'xmark']"
					size="1x"
				/>
			</b-button>
			<div class="card-body line-card">
				<h3 class="card-title">
					{{ $t(title) }}
				</h3>
				<apexchart 
					type="bar" 
					:options="chartOptions" 
					:series="series"
					height="274.69"
					width="568"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "BarChart",
	props: {
		options: { type: Object, default: null },
		series: { type: Array, default: null },
		title: { type: String, default: null },
		edit: { type: Boolean, default: false },
		i: { type: Number, default: 0 }
	},
	data() {
		return {
			chartOptions: {
				chart: {
					height: 275,
					width: 568,
					type: 'bar'
				},
				plotOptions: {
					bar: {
						borderRadius: 10,
						dataLabels: {
							position: 'top'
						},
					}
				},
				responsive: [
					{
						breakpoint: 700,
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
	},
	methods: {
		removeItem() {
			this.$emit('removeItem', this.i)
		}
	}
}
</script>
