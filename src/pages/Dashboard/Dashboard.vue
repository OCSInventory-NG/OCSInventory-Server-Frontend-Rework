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
					<div 
						class="col-auto ms-auto div-save-search" 
						align="right"
					>
						<b-row>
							<b-col>
								<button 
									:title="$t('search.editsavesearch')"
									class="btn datatable-btn mr-1"
									@click="edit = !edit"
								>
									<font-awesome-icon 
										:icon="['fas', 'pencil']"
									/>
								</button>
							</b-col>
							<b-col cols="2">
								<v-select
									v-model="activeLayout" 
									:options="optlayouts" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
								/>
							</b-col>
						</b-row>
					</div>
					
					<div 
						v-if="loading"
						class="ocs-loader"
					>
						<Loader />
					</div>
					<GridLayout 
						v-else
						v-model:layout="layouts[activeLayout].layout"
						:row-height="30"
						:static="true"
						:responsive="true"
						:class="(edit) ? 'display-grid': ''"
					>
						<GridItem
							v-for="item in layouts[activeLayout].layout"
							:key="item.name"
							:x="item.x"
							:y="item.y"
							:w="item.w"
							:h="item.h"
							:i="item.i"
							:min-w="item.minw"
							:min-h="item.minh"
							:static="!edit"
							:is-resizable="item.resizable"
						>
							<Counter 
								v-if="item.type == 'Counter'"
								:firsttitle="'dashboard.'+item.name"
								:firstcount="chartData[item.i].data.total"
								secondtitle="dashboard.contacted"
								:secondcount="chartData[item.i].data.contacted"
							/>
							<PieChart
								v-if="item.type == 'DonutChart'"
								:title="'dashboard.'+item.name"
								:options="chartData[item.i].data.options"
								:series="chartData[item.i].data.series"
							/>
							<LineChart
								v-if="item.type == 'LineChart'"
								:title="'dashboard.'+item.name"
								:options="chartData[item.i].data.options"
								:series="chartData[item.i].data.series"
							/>
							<BarChart
								v-if="item.type == 'BarChart'"
								:title="'dashboard.'+item.name"
								:options="chartData[item.i].data.options"
								:series="chartData[item.i].data.series"
							/>
						</GridItem>
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
import PieChart from '@/components/Dashboard/Chart/Pie.vue'
import LineChart from '@/components/Dashboard/Chart/Line.vue'

export default {
	name: "Dashboard",
	components: { 
		BarChart,
		Counter,
		PieChart,
		LineChart,
	},
	data() {
		return {
			chartData: [],
			draggable: true,
			resizable: true,
			errormsg: null,
			loading: true,
			errored: false,
			layouts: [],
			edit: false,
			activeLayout: null,
			optlayouts: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async beforeMount() {
		await this.getLayouts()
		if (!this.errored) {
			await this.getChartData()
			this.loading = false
		}
	},
	methods: {
		async getLayouts() {
			const response = await axios.get(import.meta.env.VITE_APP_API_ROUTE+"dashboard/layout/", { headers: this.header })
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})

			if(
				response
				&& response.status == 200
			) {
				this.layouts = response.data
			}
		},
		async getChartData() {
			var index = 0
			this.optlayouts = []
			for (const charts of this.layouts) {
				this.optlayouts.push({
					value: index,
					text: charts.name
				})
				for (const chart of charts.layout) {
					await axios.get(import.meta.env.VITE_APP_API_ROUTE+"dashboard/chart/"+chart.name, { headers: this.header })
						.then(response => {
							this.loading = true
							this.chartData.push({
								name: chart.name,
								data: response.data
							})
							this.errormsg = null
							this.errored = false
						})
						.catch(e => {
							this.errormsg = e.message
							this.errored = true
						})
				}
				this.activeLayout = index
				index = index + 1
			}
		}
	}
}
</script>