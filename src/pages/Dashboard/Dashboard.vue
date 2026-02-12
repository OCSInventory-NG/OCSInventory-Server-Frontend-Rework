<template>
	<div class="container-xl">
		<PageHeader page-title="dashboard" />
		
		<div class="page-body">
			<div class="card">
				<div class="card-body">
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
									:chart-name="item.name"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<PieChart
									v-if="chartsVisible && item.type == 'DonutChart'"
									:title="'dashboard.'+item.name"
									:chart-name="item.name"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<LineChart
									v-if="chartsVisible && item.type == 'LineChart'"
									:title="'dashboard.'+item.name"
									:chart-name="item.name"
									:edit="edit"
									:i="item.i"
									@removeItem="removeItem"
								/>
								<BarChart
									v-if="chartsVisible && item.type == 'BarChart'"
									:title="'dashboard.'+item.name"
									:chart-name="item.name"
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
	data() {
		return {
			errormsg: null,
			errored: false,

			savewithsuccess: false,
			saveerror: false,

			canedit: false,
			canadd: false,
			candelete: false,

			chartsVisible: false,
			draggable: true,
			resizable: true,
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
			userid: null,
			groupids: [],
			groups: [],
			addchartid: null,
			optvisibility: [
				{ value: "public", text: this.$t("search.public") },
				{ value: "private_personal", text: this.$t("search.private_personal") },
				{ value: "private_group", text: this.$t("search.private_group") }
			],

			loadingsave: false,
			loading: true,
			loadingchart: false,
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
		// Active layout (storage)
		const storedActiveLayout = localStorage.getItem('active_layout')
		this.activeLayout = storedActiveLayout ? parseInt(storedActiveLayout, 10) : 0

		// Permissions (une seule lecture)
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		this.canadd = permissions.includes("layout_add_dashboardlayout")
		this.canedit = permissions.includes("layout_change_dashboardlayout")
		this.candelete = permissions.includes("layout_delete_dashboardlayout")

		// Reset états
		this.loading = true
		this.errored = false
		this.errormsg = null

		// 1) Toujours récupérer le compte d'abord (userid/groupids)
		await this.getUserAccount()

		// Si déjà en erreur, on stoppe (évite d'enchaîner des appels inutiles)
		if (this.errored) {
			this.loading = false
			return
		}

		// 2) Le reste en parallèle
		await Promise.all([
			this.getGroups(),
			this.getChartsList(),
			this.getLayouts(),
		])

		if (!this.errored) {
			this.loading = false
		}

		// Evite un flash/layout “vide” au montage
		setTimeout(() => {
			this.chartsVisible = true
		}, 10)
	},
	methods: {
		async getChartsList() {
			this.optcharts = []
			try {
				const data = await this.$api.generic.get("dashboard/chart/")
				const charts = Array.isArray(data) ? data : (data?.results || [])

				this.optcharts = charts.map((chart) => ({
					value: `${chart.name};${chart.charttype}`,
					text: this.$t('dashboard.' + chart.description),
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getUserAccount() {
			try {
				const data = await this.$api.generic.get("myaccount/")
				this.userid = data?.id
				this.groupids = data?.groups || []

				this.ensureEmptyLayoutInitialized()
				if (this.emptylayout.user === null || this.emptylayout.user === undefined) {
					this.emptylayout.user = this.userid
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getGroups() {
			this.groups = []

			if (!Array.isArray(this.groupids) || !this.groupids.length) return

			try {
				const results = await Promise.allSettled(
					this.groupids.map((id) => this.$api.generic.get(`groups/${id}/`))
				)

				results.forEach((r) => {
					if (r.status === "fulfilled") {
						const g = r.value
						this.groups.push({ value: g.id, text: g.name })
					} else {
						const e = r.reason
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
					}
				})

				this.groups.sort((a, b) => (a.text || "").localeCompare(b.text || ""))

				if (!this.errored) {
					this.errormsg = null
					this.errored = false
				}
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getLayouts() {
			this.layouts = []
			try {
				const data = await this.$api.generic.get("dashboard/layout/")
				const layouts = Array.isArray(data) ? data : (data?.results || [])

				// filtre d'accès
				this.layouts = layouts.filter((l) =>
					l.visibility === "public"
					|| l.user === this.userid
					|| (l.visibility === "private_group" && this.hasGroupAccess(l.groups))
				)

				this.optlayouts = this.layouts.map((layout, index) => ({
					value: index,
					text: layout.name,
				}))

				if (!this.layouts.length) {
					this.layouts = [{ layout: [] }]
				} else {
					if (!this.layouts[this.activeLayout]) this.activeLayout = 0
					this.syncEmptyLayoutFromActive()
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async saveDashboard() {
			this.loadingsave = true
			try {
				const layoutId = this.layouts?.[this.activeLayout]?.id
				if (!layoutId) throw new Error("No active layout id")

				this.emptylayout.layout = this.layouts[this.activeLayout].layout

				await this.$api.generic.patch(`dashboard/layout/${layoutId}/`, this.emptylayout)

				this.savewithsuccess = true
				this.saveerror = false
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.savewithsuccess = false
				this.saveerror = true
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loadingsave = false
			}
		},

		async addDashboard() {
			this.loadingsave = true
			try {
				this.emptylayout.layout = this.layouts[this.activeLayout].layout

				const { id, ...payload } = this.emptylayout

				await this.$api.generic.post("dashboard/layout/", payload)

				this.savewithsuccess = true
				this.saveerror = false
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.savewithsuccess = false
				this.saveerror = true
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loadingsave = false
				this.reloadDashboard()
			}
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
			try {
				await this.getLayouts()
			} finally {
				if (!this.errored) this.loading = false
			}
		},

		removeItem(i) {
			let index = this.layouts[this.activeLayout].layout.findIndex(item => item.i === i)

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
			if (!this.addchartid) return

			const [name, type] = this.addchartid.split(";")
			const index = this.layouts[this.activeLayout].layout.length

			this.layouts[this.activeLayout].layout.push(
				type === "Counter"
					? { x: 0, y: 0, w: 2, h: 4, i: index, minw: 2, minh: 4, name, type: "Counter", resizable: true }
					: { x: 0, y: 0, w: 6, h: 9, i: index, minw: 6, minh: 9, name, type, resizable: false }
			)

			this.addchartid = null
		},

		hasGroupAccess(groups = []) {
			if (!Array.isArray(groups) || !Array.isArray(this.groupids)) return false
			return groups.some(group => this.groupids.includes(group))
		},

		ensureEmptyLayoutInitialized() {
			if (!this.emptylayout) this.emptylayout = createEmptyLayout()
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
		},
	}
}
</script>