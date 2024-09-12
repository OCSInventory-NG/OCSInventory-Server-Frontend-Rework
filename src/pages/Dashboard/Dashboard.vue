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
						v-if="loading"
						class="ocs-loader"
					>
						<Loader />
					</div>

					<div v-else>
						<div 
							class="col-auto ms-auto div-save-search"
						>
							<b-row>
								<b-col 
									v-if="layouts[activeLayout].name"
									cols="2"
								>
									<v-select
										v-model="activeLayout" 
										:options="optlayouts" 
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
									/>
								</b-col>
								<b-col cols="1">
									<button 
										v-if="canadd"
										:title="$t('dashboard.adddashboardlayout')"
										class="btn datatable-btn mr-1"
										@click="edit = !edit"
									>
										<font-awesome-icon 
											:icon="['fas', 'plus']"
										/>
									</button>
								</b-col>
								<b-col 
									v-if="layouts[activeLayout].name"
									align="right"
								>
									<b-row>
										<b-col>
											<b-spinner 
												v-if="loadingsave"
												variant="success"
											/>
											<font-awesome-icon 
												v-if="savewithsuccess"
												:icon="['fas', 'check']"
												color="green"
											/>
											<font-awesome-icon 
												v-if="saveerror"
												:icon="['fas', 'xmark']"
												color="red"
											/>
											&nbsp;
											<b-button 
												v-if="edit"
												type="submit"
												variant="success"
												@click="saveDashboard()"
											>
												{{ $t('generic.save') }}
											</b-button>
											&nbsp;
											<b-button 
												v-if="edit"
												type="submit"
												variant="danger"
												@click="reloadDashboard()"
											>
												{{ $t('generic.cancel') }}
											</b-button>
											&nbsp;
											<button 
												v-if="canedit"
												:title="$t('dashboard.editdashboardlayout')"
												class="btn datatable-btn mr-1"
												:disabled="edit"
												@click="edit = !edit"
											>
												<font-awesome-icon 
													:icon="['fas', 'pencil']"
												/>
											</button>
										</b-col>
										<b-col 
											cols="1"
											align="left"
										>
											<DeleteItemModal
												v-if="candelete"
												:id="layouts[activeLayout].id"
												:name="layouts[activeLayout].name"
												customclass="datatable-btn mr-1"
												parameter="dashboard/layout"
												@reloadDashboard="reloadDashboard"
											/>
										</b-col>
									</b-row>
								</b-col>
							</b-row>
						</div>

						<Alert 
							v-if="!layouts[activeLayout].name"
							:message="$t('dashboard.nodashboard')" 
							variant="info"
						/>

						<GridLayout 
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
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<PieChart
									v-if="item.type == 'DonutChart'"
									:title="'dashboard.'+item.name"
									:options="chartData[item.i].data.options"
									:series="chartData[item.i].data.series"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<LineChart
									v-if="item.type == 'LineChart'"
									:title="'dashboard.'+item.name"
									:options="chartData[item.i].data.options"
									:series="chartData[item.i].data.series"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<BarChart
									v-if="item.type == 'BarChart'"
									:title="'dashboard.'+item.name"
									:options="chartData[item.i].data.options"
									:series="chartData[item.i].data.series"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
							</GridItem>
						</GridLayout>
					</div>
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
			canedit: false,
			canadd: false,
			candelete: false,
			chartData: [],
			draggable: true,
			resizable: true,
			errormsg: null,
			loading: true,
			errored: false,
			layouts: [
				{
					layout: []
				}
			],
			edit: false,
			activeLayout: null,
			optlayouts: [],
			loadingsave: false,
			savewithsuccess: false,
			saveerror: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async beforeMount() {
		if(localStorage.getItem('permissions').split(",").includes("layout_add_dashboardlayout")) {
			this.canadd = true
		}
		if(localStorage.getItem('permissions').split(",").includes("layout_change_dashboardlayout")) {
			this.canedit = true
		}
		if(localStorage.getItem('permissions').split(",").includes("layout_delete_dashboardlayout")) {
			this.candelete = true
		}

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
				if(response.data.length) {
					this.layouts = response.data
				}
			}
		},
		async getChartData() {
			var index = 0
			this.optlayouts = []
			this.chartData = []
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
		},
		saveDashboard() {
			this.loadingsave = true
			var layoutId = this.layouts[this.activeLayout].id
			var layout = this.layouts[this.activeLayout]

			axios.patch(import.meta.env.VITE_APP_API_ROUTE+"dashboard/layout/"+layoutId+"/", layout,
				{ headers: this.header })
				.then(() => {
					this.savewithsuccess = true
					this.saveerror = false
					this.errormsg = null
					this.errored = false
					this.edit = false
				})
				.catch(e => {
					this.savewithsuccess = false
					this.saveerror = true
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loadingsave = false)
		},
		async reloadDashboard() {
			this.loading = true
			this.edit = false
			await this.getLayouts()
			if (!this.errored) {
				await this.getChartData()
				this.loading = false
			}
		},
		removeItem(i) {
			var index = this.layouts[this.activeLayout].layout.findIndex(item => item.i === i)

			if (index > -1) {
				this.layouts[this.activeLayout].layout.splice(index, 1)
				this.chartData.splice(index, 1)
				for (const layout of this.layouts[this.activeLayout].layout) {
					if (layout.i > index) {
						layout.i = index
						index = index + 1
					}
				}
			}
		}
	}
}
</script>