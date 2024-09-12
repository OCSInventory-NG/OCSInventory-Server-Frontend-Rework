<template>
	<div id="pie">
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
					width="568"
					type="pie" 
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
					width: 568,
					type: 'pie'
				},
				responsive: [
					{
						breakpoint: 568,
						options: {
							chart: {
								width: 200
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