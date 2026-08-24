<template>
	<div
		id="line"
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
					type="line" 
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
	name: "LineChart",
	props: {
		chartName: { type: String, default: null },
		title: { type: String, default: null },
		edit: { type: Boolean, default: false },
		i: { type: Number, default: 0 }
	},
	emits: ["removeItem"],
	data() {
		return {
			errored: false,
			errormsg: null,

			chartOptions: {
				chart: {
					height: 275,
					width: '100%',
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
			},
			series: [],

			loaded: false,
		}
	},
	computed: {
		computedTitle() {
			return `dashboard.${this.chartName}`
		}
	},
	async mounted() {
		try {
			const data = await this.$api.generic.get(
				`dashboard/chart/${this.chartName}/`
			)

			this.series = data?.series || []
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
