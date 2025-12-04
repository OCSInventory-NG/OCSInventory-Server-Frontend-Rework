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
				<div v-if="!loaded && !errored" class="text-center py-4">
					<b-spinner />
				</div>
				<div v-else-if="errored" class="text-center py-4 text-danger">
					{{ $t("dashboard.error_loading_chart") }}
				</div>
				<apexchart 
					v-else
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
import axios from 'axios';

export default {
	name: "Pie",
	props: {
		chartName: { type: String, default: null },
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
			series: [],
			loaded: false,
			errored: false,
			errormsg: null
		}
	},
	computed: {
		computedTitle() {
			return `dashboard.${this.chartName}`;
		}
	},
	async mounted() {
		try {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			const response = await axios.get(
				`${this.$config.BACKEND_API_ROUTE}dashboard/chart/${this.chartName}/`,
				{ headers: header }
			)
			if (response.data.options?.labels && Array.isArray(response.data.series)) {
				this.chartOptions.labels = response.data.options.labels;
				this.series = response.data.series;
			} else {
				throw new Error("Format de données inattendu");
			}
			this.loaded = true;
		} catch(e) {
			this.errored = true
			this.errormsg = e.response?.data?.error || e.message
		}
	},
	methods: {
		removeItem() {
			this.$emit('removeItem', this.i)
		}
	}
}
</script>