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
					{{ $t(computedTitle) }}
				</h3>
				<div
					v-if="!loaded && !errored"
					class="text-center py-4"
				>
					<b-spinner />
				</div>
				<div
					v-else-if="errored"
					class="text-center py-4 text-danger"
				>
					{{ $t("dashboard.error_loading_chart") }}
				</div>
				<apexchart 
					v-else
					type="bar" 
					:options="chartOptions" 
					:series="chartSeries"
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
		chartName: { type: String, default: null },
		title: { type: String, default: null },
		edit: { type: Boolean, default: false },
		i: { type: Number, default: 0 },
		options: { type: Object, default: null },
		series: { type: [Array, Object], default: () => [] }
	},
	emits: ["removeItem"],
	data() {
		return {
			errored: false,
			errormsg: null,

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
			},
			chartSeries: [],

			loaded: false,
		}
	},
	computed: {
		computedTitle() {
			if (this.chartName) {
				return `dashboard.${this.chartName}`;
			}
			return this.title || 'dashboard.chart';
		}
	},
	async mounted() {
		if (this.options && this.series) {
			if (this.options.xaxis) {
				this.chartOptions.xaxis = this.options.xaxis
			}
			this.chartSeries = this.series
			this.loaded = true
			return
		}

		if (!this.chartName) {
			this.loaded = true
			return
		}

		try {
			const data = await this.$api.generic.get(
				`dashboard/chart/${this.chartName}/`
			)

			this.chartSeries = data?.series || []
			this.chartOptions.xaxis = data?.options?.xaxis || {}

			this.errored = false
			this.errormsg = null
		} catch (e) {
			this.errored = true
			this.errormsg = e.response?.data?.error || e.message
		} finally {
			this.loaded = true
		}
	},
	methods: {
		removeItem() {
			this.$emit('removeItem', this.i)
		}
	}
}
</script>
