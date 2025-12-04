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
							:cols="true" 
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
									v-if="layouts[activeLayout].id"
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
									<button 
										v-if="canedit || canadd"
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
								<b-col v-if="edit">
									<v-select
										v-model="addchartid"
										:options="optcharts"
										:reduce="text => text.value"
										:clearable="false"
										:placeholder="$t('dashboard.chartplaceholder')"
										label="text"
										class="mb-3 ocs-select"
										@option:selected="addItem()"
									/>
								</b-col>
								<b-col 
									v-if="
										layouts[activeLayout].id 
											&& (
												layouts[activeLayout].user == userid
												|| (
													hasGroupAccess(layouts[activeLayout].groups)
													&& layouts[activeLayout].allow_group_modification == true
												)
											)
									"
									align="right"
								>
									<b-row>
										<b-col
											align="right"
										>
											<DeleteItemModal
												v-if="candelete"
												:id="layouts[activeLayout].id"
												:name="layouts[activeLayout].name"
												customclass="datatable-btn mr-1"
												parameter="dashboard/layout"
												:disabled="edit"
												@reloadDashboard="reloadDashboard"
											/>
										</b-col>
									</b-row>
								</b-col>
							</b-row>
						</div>

						<div align="center">
							<b-col cols="6">
								<Alert 
									v-if="!layouts[activeLayout].id && !edit"
									:message="$t('dashboard.nodashboard')"
									:cols="true" 
									variant="info"
								/>
							</b-col>
						</div>

						<div align="center">
							<div 
								v-if="edit"
								class="multisearch-card col-6"
							>
								<b-row>
									<b-col>
										<b-form-group
											:label="$t('search.name')" 
											label-for="name"
										>
											<b-form-input
												id="name"
												v-model="emptylayout.name"
												required
											/>
										</b-form-group>
									</b-col>
									<b-col>
										<b-form-group
											:label="$t('search.visibility')" 
											label-for="visibility"
										>
											<v-select
												id="visibility"
												v-model="emptylayout.visibility" 
												:options="optvisibility" 
												:reduce="text => text.value"
												:clearable="false"
												label="text"
												class="mb-3"
											/>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row v-if="emptylayout.visibility == 'private_group'">
									<b-col>
										<b-form-group
											:label="$t('search.groups')" 
											label-for="groups"
										>
											<v-select 
												v-model="emptylayout.groups"
												:options="groups"
												:reduce="text => text.value"
												label="text"
												multiple
											/>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row v-if="emptylayout.visibility == 'private_group'">
									<b-col>
										<b-form-group
											:label="$t('search.allow_group_modification')" 
											label-for="allow_group_modification"
										>
											<label class="form-check form-switch">
												<input 
													v-model="emptylayout.allow_group_modification"
													class="form-check-input"
													type="checkbox"
												>
											</label>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row>
									<b-col>
										<b-button 
											v-if="canadd"
											type="submit"
											variant="success"
											@click="addDashboard()"
										>
											{{ $t('generic.saveas') }}
										</b-button>
										&nbsp;
										<b-button
											v-if="
												canedit
													&& layouts[activeLayout].id
													&& (
														layouts[activeLayout].user == userid
														|| (
															hasGroupAccess(layouts[activeLayout].groups)
															&& layouts[activeLayout].allow_group_modification == true
														)
													)
											"
											type="submit"
											variant="success"
											@click="saveDashboard()"
										>
											{{ $t('generic.save') }}
										</b-button>
										&nbsp;
										<b-button 
											type="submit"
											variant="danger"
											@click="reloadDashboard()"
										>
											{{ $t('generic.cancel') }}
										</b-button>
									</b-col>
								</b-row>
							</div>
						</div>

						<div
							v-if="loadingchart"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<GridLayout 
							v-else
							:key="activeLayout"
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
									v-if="chartsVisible && item.type == 'Counter'"
									:firsttitle="'dashboard.'+item.name"
									secondtitle="dashboard.contacted"
									:chartName="item.name"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<PieChart
									v-if="chartsVisible && item.type == 'DonutChart'"
									:title="'dashboard.'+item.name"
									:chartName="item.name"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<LineChart
									v-if="chartsVisible && item.type == 'LineChart'"
									:title="'dashboard.'+item.name"
									:chartName="item.name"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<BarChart
									v-if="chartsVisible && item.type == 'BarChart'"
									:title="'dashboard.'+item.name"
									:chartName="item.name"
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

const createEmptyLayout = () => ({
	visibility: "public",
	user: null,
	groups: [],
	allow_group_modification: false,
	name: null,
	layout: []
})

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
			chartsVisible: false,
			draggable: true,
			resizable: true,
			errormsg: null,
			loading: true,
			errored: false,
			emptylayout: createEmptyLayout(),
			layouts: [
				{
					layout: []
				}
			],
			edit: false,
			activeLayout: 0,
			optlayouts: [],
			optcharts: [],
			loadingsave: false,
			savewithsuccess: false,
			saveerror: false,
			userid: null,
			groupids: [],
			groups: [],
			addchartid: null,
			loadingchart: false,
			optvisibility: [
				{ value: "public", text: this.$t("search.public") },
				{ value: "private_personal", text: this.$t("search.private_personal") },
				{ value: "private_group", text: this.$t("search.private_group") }
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		savewithsuccess: function() {
			setTimeout(() => {
				this.edit = false
				this.savewithsuccess = false
			}, 500)
		},
		activeLayout() {
			this.onActiveLayoutChanged()
		}
	},
	async beforeMount() {
		const storedActiveLayout = localStorage.getItem('active_layout')
		if (storedActiveLayout) {
			this.activeLayout = parseInt(storedActiveLayout)
		}
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []
		if(permissions.includes("layout_add_dashboardlayout")) {
			this.canadd = true
		}
		if(permissions.includes("layout_change_dashboardlayout")) {
			this.canedit = true
		}
		if(permissions.includes("layout_delete_dashboardlayout")) {
			this.candelete = true
		}

		await this.getUserAccount()
		await this.getGroups()
		await this.getChartsList()
		await this.getLayouts()
		if (!this.errored) {
			this.loading = false
		}
		setTimeout(() => {
			this.chartsVisible = true
		}, 10)
	},
	methods: {
		async getChartsList() {
			this.optcharts = []

			await axios.get(this.$config.BACKEND_API_ROUTE+"dashboard/chart/", { headers: this.header })
				.then(response => {
					for (const chart of response.data) {
						this.optcharts.push({
							value: chart.name + ";" + chart.charttype,
							text: this.$t('dashboard.' + chart.description)
						})
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getUserAccount() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"myaccount/", { headers: this.header })
				.then(response => {
					this.userid = response.data.id
					this.groupids = response.data.groups
					this.ensureEmptyLayoutInitialized()
					if (this.emptylayout.user === null || this.emptylayout.user === undefined) {
						this.emptylayout.user = this.userid
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getGroups() {
			this.groups = []
			if (!Array.isArray(this.groupids) || !this.groupids.length) {
				return
			}
			const requests = this.groupids.map(group =>
				axios.get(this.$config.BACKEND_API_ROUTE+"groups/"+group+"/", { headers: this.header })
			)
			const results = await Promise.allSettled(requests)

			results.forEach(result => {
				if (result.status === "fulfilled") {
					const response = result.value
					this.groups.push({
						value: response.data.id,
						text: response.data.name
					})
					this.errormsg = null
					this.errored = false
				} else {
					const e = result.reason
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				}
			})

			this.groups.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
		},
		async getLayouts() {
			this.layouts = []
			const response = await axios.get(this.$config.BACKEND_API_ROUTE+"dashboard/layout/", { headers: this.header })
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})

			if(
				response
				&& response.status == 200
			) {
				if(response.data.length) {
					for (const layouts of response.data) {
						if (
							layouts.visibility == "public"
							|| layouts.user == this.userid
							|| (
								layouts.visibility == "private_group"
								&& this.hasGroupAccess(layouts.groups)
							)
						) {
							this.layouts.push(layouts)
						}
						this.optlayouts = this.layouts.map((layout, index) => ({
							value: index,
							text: layout.name
						}));
					}
				}

				if (!this.layouts.length) {
					this.layouts = [
						{
							layout: []
						}
					]
				} else {
					if (!this.layouts[this.activeLayout]) {
						this.activeLayout = 0
					}
					this.syncEmptyLayoutFromActive()
				}
			}
		},
		saveDashboard() {
			this.loadingsave = true
			var layoutId = this.layouts[this.activeLayout].id

			this.emptylayout.layout = this.layouts[this.activeLayout].layout

			axios.patch(this.$config.BACKEND_API_ROUTE+"dashboard/layout/"+layoutId+"/", this.emptylayout,
				{ headers: this.header })
				.then(() => {
					this.savewithsuccess = true
					this.saveerror = false
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.savewithsuccess = false
					this.saveerror = true
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loadingsave = false)
		},
		addDashboard() {
			this.loadingsave = true

			this.emptylayout.layout = this.layouts[this.activeLayout].layout
			delete this.emptylayout.id

			axios.post(this.$config.BACKEND_API_ROUTE+"dashboard/layout/", this.emptylayout,
				{ headers: this.header })
				.then(() => {
					this.savewithsuccess = true
					this.saveerror = false
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.savewithsuccess = false
					this.saveerror = true
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => {
					this.loadingsave = false
					this.reloadDashboard()
				})
		},
		onActiveLayoutChanged() {
			this.loadingchart = true
			localStorage.setItem('active_layout', this.activeLayout)
			this.syncEmptyLayoutFromActive()
			this.loadingchart = false
		},
		async reloadDashboard() {
			this.loading = true
			this.edit = false
			await this.getLayouts()
			if (!this.errored) {
				this.loading = false
			}
		},
		removeItem(i) {
			var index = this.layouts[this.activeLayout].layout.findIndex(item => item.i === i)

			if (index > -1) {
				this.layouts[this.activeLayout].layout.splice(index, 1)
				for (const layout of this.layouts[this.activeLayout].layout) {
					if (layout.i > index) {
						layout.i = index
						index = index + 1
					}
				}
			}
		},
		async addItem() {
			if (!this.addchartid) {
				return
			}
			var chartInfo = this.addchartid.split(";")
			var index = this.layouts[this.activeLayout].layout.length

			if (chartInfo[1] == "Counter") {
				this.layouts[this.activeLayout].layout.push({
					x: 0,
					y: 0,
					w: 2,
					h: 4,
					i: index,
					minw: 2,
					minh: 4,
					name: chartInfo[0],
					type: "Counter",
					resizable: true
				})
			} else {
				this.layouts[this.activeLayout].layout.push({
					x: 0,
					y: 0,
					w: 6,
					h: 9,
					i: index,
					minw: 6,
					minh: 9,
					name: chartInfo[0],
					type: chartInfo[1],
					resizable: false
				})
			}

			this.addchartid = null
		},
		hasGroupAccess(groups = []) {
			if (!Array.isArray(groups) || !Array.isArray(this.groupids)) {
				return false
			}
			return groups.some(group => this.groupids.includes(group))
		},
		ensureEmptyLayoutInitialized() {
			if (!this.emptylayout) {
				this.emptylayout = createEmptyLayout()
			}
		},
		syncEmptyLayoutFromActive() {
			const activeLayout = this.layouts[this.activeLayout]
			if (activeLayout) {
				this.emptylayout = activeLayout
			} else {
				this.ensureEmptyLayoutInitialized()
				this.emptylayout.layout = []
			}
			if (this.userid && (this.emptylayout.user === null || this.emptylayout.user === undefined)) {
				this.emptylayout.user = this.userid
			}
		}
	}
}
</script>