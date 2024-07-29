<template>
	<div class="container-xl">
		<PageHeader 
			page-title="dashboard"
		/>
		
		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<!-- Error box message -->
					<section v-if="errored">
						<Alert 
							:message="errormsg" 
							variant="danger"
						/>
					</section>

					{{ layouts }}
					
					<div 
						v-if="loading"
						class="ocs-loader"
					>
						<Loader />
					</div>
					<GridLayout 
						v-else
						v-model:layout="layouts.layout"
						:row-height="30"
					>
						<template #item="{ item }">
							<Counter 
								v-if="item.type == 'Counter'"
								:firsttitle="'dashboard.'+item.chart"
								:firstcount="chartData[item.chart].total"
								secondtitle="dashboard.contacted"
								:secondcount="chartData[item.chart].contacted"
							/>
						</template>
					</GridLayout>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import BarChart from '@/components/Dashboard/Chart/Bar.vue'
import Counter from '@/components/Dashboard/Counter/Counter.vue'
import DonutChart from '@/components/Dashboard/Chart/Donut.vue'
import LineChart from '@/components/Dashboard/Chart/Line.vue'

export default {
	name: "Dashboard",
	components: { 
		BarChart,
		Counter,
		DonutChart,
		LineChart,
	},
	data() {
		return {
			layout: [
				{"x":0,"y":0,"w":2,"h":3,"i":"total_ALL","type":"Counter", static: false},
				{"x":2,"y":0,"w":2,"h":3,"i":"total_WIN","type":"Counter", static: false},
				{"x":4,"y":0,"w":2,"h":3,"i":"total_LIN","type":"Counter", static: false},
				{"x":6,"y":0,"w":2,"h":3,"i":"total_MAC","type":"Counter", static: false},
				{"x":8,"y":0,"w":2,"h":3,"i":"total_LEG","type":"Counter", static: false},
				{"x":10,"y":0,"w":2,"h":3,"i":"total_SNMP","type":"Counter", static: false}
			],
			chartData: [],
			draggable: true,
			resizable: true,
			errormsg: null,
			loading: true,
			errored: false,
			layouts: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async beforeMount() {
		await this.displayDashboard()
		console.log(this.layouts)
	},
	methods: {
		async displayDashboard() {
			const response = await axios.get(import.meta.env.VITE_APP_API_ROUTE+"dashboard/layout/", { headers: this.header })
			this.layouts = response
			//await this.getChartData()
		},
		getLayouts() {
			const response = axios.get(import.meta.env.VITE_APP_API_ROUTE+"dashboard/layout/", { headers: this.header })
			console.log(response)
		},
		getChartData() {
			for (const chart of this.layouts.layout) {
				axios.get(import.meta.env.VITE_APP_API_ROUTE+"dashboard/chart/"+chart.i, { headers: this.header })
					.then(response => {
						this.loading = true
						this.chartData[chart.i] = response.data
						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			}
		}
	}
}
</script>