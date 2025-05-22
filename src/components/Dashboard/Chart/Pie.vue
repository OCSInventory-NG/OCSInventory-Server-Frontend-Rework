<template>
	<div
		id="pie"
		class="chart-container"
	>
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
			<div class="card-body">
				<h3 class="card-title">
					{{ $t(title) }}
				</h3>
				<apexchart 
					:options="chartOptions" 
					:series="series"
					type="pie"
					height="300"
					width="568"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Pie",
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
					type: 'pie',
					width: '100%',
					height: 300
				},
				responsive: [
					{
						breakpoint: 568,
						options: {
							chart: {
								width: '100%'
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
		this.chartOptions.labels = this.options["labels"]
	},
	methods: {
		removeItem() {
			this.$emit('removeItem', this.i)
		}
	}
}
</script>