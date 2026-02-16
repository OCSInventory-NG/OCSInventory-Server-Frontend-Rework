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
					:options="chartOptions" 
					:series="chartSeries"
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
		chartName: { type: String, default: null },
		title: { type: String, default: null },
		edit: { type: Boolean, default: false },
		i: { type: Number, default: 0 },
		options: { type: Object, default: null },
		series: { type: [Array, Object], default: () => [] }
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			chartOptions: {
				chart: {
					type: 'pie',
					width: '100%',
					height: 300
				},
				labels: [],
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
			if (this.options.labels && Array.isArray(this.series)) {
				this.chartOptions.labels = this.options.labels
				if (this.options.colors) {
					this.chartOptions.colors = this.options.colors
				}
				this.chartSeries = this.series
			}
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

			if (data?.options?.labels && Array.isArray(data?.series)) {
				this.chartOptions.labels = data.options.labels
				this.chartSeries = data.series
			} else {
				throw new Error("Format de données inattendu")
			}

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