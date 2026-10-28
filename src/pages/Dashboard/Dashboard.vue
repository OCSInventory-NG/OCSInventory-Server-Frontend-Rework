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
						<div class="ocs-toolbar">
							<!-- the actions hang on the picker, they act on the dashboard it shows -->
							<div class="toolbar-group toolbar-start">
								<div class="select-btn-group">
									<v-select
										v-if="hasdashboard"
										id="dashboard-select"
										v-model="activeLayout"
										:options="optlayouts"
										:reduce="text => text.value"
										:clearable="false"
										:disabled="edit"
										label="text"
									/>

									<!-- Save the arrangement of the charts -->
									<button
										v-if="cansave"
										:title="$t('dashboard.save')"
										class="btn datatable-btn toolbar-btn"
										:disabled="!edit || loadingsave"
										@click="saveDashboard()"
									>
										<b-spinner
											v-if="loadingsave"
											small
										/>
										<font-awesome-icon
											v-else
											:icon="['far', 'floppy-disk']"
										/>
									</button>

									<button
										v-if="canadd"
										:title="$t('dashboard.saveas')"
										class="btn datatable-btn toolbar-btn"
										@click="openForm(false)"
									>
										<font-awesome-icon :icon="['fas', 'file-circle-plus']" />
									</button>

									<button
										v-if="cansave"
										:title="$t('dashboard.edit')"
										class="btn datatable-btn toolbar-btn"
										:disabled="edit"
										@click="openForm(true)"
									>
										<font-awesome-icon :icon="['fas', 'pencil']" />
									</button>

									<button
										v-if="canremove"
										:title="$t('dashboard.delete')"
										class="btn datatable-btn toolbar-btn text-danger"
										:disabled="edit"
										@click="openDelete()"
									>
										<font-awesome-icon :icon="['fas', 'trash-can']" />
									</button>
								</div>
							</div>

							<!-- Rearrange the charts -->
							<div class="toolbar-group toolbar-end">
								<template v-if="edit">
									<v-select
										id="dashboard-chart-select"
										v-model="addchartid"
										:options="optcharts"
										:reduce="text => text.value"
										:clearable="false"
										:placeholder="$t('dashboard.chartplaceholder')"
										label="text"
										@option:selected="addItem()"
									/>
									<button
										class="btn datatable-btn"
										@click="reloadDashboard()"
									>
										<font-awesome-icon
											:icon="['fas', 'xmark']"
											class="me-1"
										/>
										{{ $t('generic.cancel') }}
									</button>
								</template>
								<button
									v-else-if="cansave || canadd"
									class="btn datatable-btn"
									@click="edit = true"
								>
									<font-awesome-icon
										:icon="['fas', 'sliders']"
										class="me-1"
									/>
									{{ $t('dashboard.customize') }}
								</button>
							</div>
						</div>

						<p
							v-if="edit"
							class="dashboard-hint"
						>
							<font-awesome-icon
								:icon="['fas', 'circle-info']"
								class="me-1"
							/>
							{{ $t('dashboard.customizehelp') }}
						</p>

						<div align="center">
							<b-col cols="6">
								<Alert 
									v-if="!hasdashboard && !edit"
									:message="$t('dashboard.nodashboard')"
									:cols="true" 
									variant="info"
								/>
							</b-col>
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
									@remove-item="removeItem"
								/>
								<PieChart
									v-if="chartsVisible && item.type == 'DonutChart'"
									:title="'dashboard.'+item.name"
									:chart-name="item.name"
									:edit="edit"
									:i="item.i"
									@remove-item="removeItem"
								/>
								<LineChart
									v-if="chartsVisible && item.type == 'LineChart'"
									:title="'dashboard.'+item.name"
									:chart-name="item.name"
									:edit="edit"
									:i="item.i"
									@remove-item="removeItem"
								/>
								<BarChart
									v-if="chartsVisible && item.type == 'BarChart'"
									:title="'dashboard.'+item.name"
									:chart-name="item.name"
									:edit="edit"
									:i="item.i"
									@remove-item="removeItem"
								/>
							</GridItem>
						</GridLayout>

						<!-- Create / edit form -->
						<b-modal
							id="dashboardmodal"
							v-model="formmodal"
							hide-footer
							modal-class="custom-modal"
							size="lg"
						>
							<template #header="{ close }">
								<h5 class="modal-title">
									{{ editingid ? $t('dashboard.editdashboard') : $t('dashboard.savedashboard') }}
									<b-spinner
										v-if="loadingform"
										variant="success"
									/>
								</h5>
								<b-button
									size="sm"
									variant="outline-danger"
									@click="close()"
								>
									<font-awesome-icon
										:icon="['fas', 'xmark']"
										size="1x"
									/>
								</b-button>
							</template>

							<div class="ocs-modal-form">
								<Alert
									v-if="formerror"
									:message="formerrormsg"
									variant="danger"
								/>

								<b-form @submit="onSubmit">
									<b-row>
										<b-col md="7">
											<b-form-group
												class="mb-2"
												:label="$t('dashboard.name')"
												label-for="dashboard-name"
											>
												<b-form-input
													id="dashboard-name"
													v-model="form.name"
													:placeholder="$t('dashboard.nameplaceholder')"
													required
												/>
											</b-form-group>
										</b-col>
										<b-col md="5">
											<b-form-group
												class="mb-2"
												:label="$t('search.visibility')"
												label-for="dashboard-visibility"
											>
												<v-select
													id="dashboard-visibility"
													v-model="form.visibility"
													:options="optvisibility"
													:reduce="text => text.value"
													:clearable="false"
													label="text"
													class="ocs-select"
												/>
											</b-form-group>
										</b-col>
									</b-row>

									<b-row v-if="form.visibility == 'private_group'">
										<b-col md="7">
											<b-form-group
												class="mb-2"
												:label="$t('search.groups')"
												label-for="dashboard-groups"
											>
												<v-select
													id="dashboard-groups"
													v-model="form.groups"
													:options="groups"
													:reduce="text => text.value"
													label="text"
													class="ocs-select"
													multiple
												/>
											</b-form-group>
										</b-col>
										<b-col md="5">
											<b-form-group
												class="mb-2"
												:label="$t('search.allow_group_modification')"
												label-for="dashboard-allow-group"
											>
												<label class="form-check form-switch">
													<input
														id="dashboard-allow-group"
														v-model="form.allow_group_modification"
														class="form-check-input"
														type="checkbox"
													>
												</label>
											</b-form-group>
										</b-col>
									</b-row>

									<!-- an edit only renames or shares, the charts go through the save button -->
									<p
										v-if="!editingid"
										class="text-muted mt-2 mb-0"
									>
										{{ $t('dashboard.chartshelp', { count: activedashboard.layout.length }) }}
									</p>

									<div class="text-center mt-3">
										<b-button
											type="submit"
											variant="success"
											:disabled="loadingform"
										>
											{{ editingid ? $t('generic.save') : $t('generic.add') }}
										</b-button>
										<b-button
											variant="outline-secondary"
											class="ms-2"
											@click="formmodal = false"
										>
											{{ $t('generic.cancel') }}
										</b-button>
									</div>
								</b-form>
							</div>
						</b-modal>

						<!-- Delete confirmation -->
						<b-modal
							id="dashboarddeletemodal"
							v-model="deletemodal"
							:title="$t('dashboard.delete')"
							hide-footer
							size="sm"
						>
							<Alert
								v-if="deleteerror"
								:message="deleteerrormsg"
								variant="danger"
							/>
							<div class="text-center">
								<font-awesome-icon
									:icon="['fas', 'triangle-exclamation']"
									size="5x"
									color="#d63939"
								/>
								<p><b>{{ $t('message.deletevalid') }}</b></p>
								<p>{{ $t('message.delete_msg') }} {{ activedashboard.name }} ?</p>
								<button
									class="btn btn-danger"
									:disabled="loadingdelete"
									@click="onDelete()"
								>
									{{ $t('generic.delete_msg2') }}
								</button>
							</div>
						</b-modal>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

export default {
	name: "Dashboard",
	data() {
		return {
			errormsg: null,
			errored: false,

			canedit: false,
			canadd: false,
			candelete: false,

			chartsVisible: false,
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

			formmodal: false,
			editingid: null,
			form: {
				name: null,
				visibility: "public",
				groups: [],
				allow_group_modification: false,
			},
			loadingform: false,
			formerror: false,
			formerrormsg: null,

			deletemodal: false,
			loadingdelete: false,
			deleteerror: false,
			deleteerrormsg: null,

			loadingsave: false,
			loading: true,
			loadingchart: false,
		}
	},
	computed: {
		optvisibility() {
			return [
				{ value: "public", text: this.$t("search.public") },
				{ value: "private_personal", text: this.$t("search.private_personal") },
				{ value: "private_group", text: this.$t("search.private_group") },
			]
		},

		activedashboard() {
			return this.layouts[this.activeLayout] || { layout: [] }
		},

		hasdashboard() {
			return !!this.activedashboard.id
		},

		// the author always may, a group member only when allowed to
		cansave() {
			const dashboard = this.activedashboard
			return this.hasdashboard
				&& this.canedit
				&& (
					dashboard.user == this.userid
					|| (
						dashboard.visibility === "private_group"
						&& dashboard.allow_group_modification == true
						&& this.hasGroupAccess(dashboard.groups)
					)
				)
		},

		canremove() {
			return this.hasdashboard
				&& this.candelete
				&& this.activedashboard.user == this.userid
		},
	},
	watch: {
		activeLayout() {
			this.onActiveLayoutChanged()
		}
	},
	async beforeMount() {
		const storedActiveLayout = localStorage.getItem('active_layout')
		this.activeLayout = storedActiveLayout ? parseInt(storedActiveLayout, 10) : 0

		this.canadd = hasPermission("layout_add_dashboardlayout")
		this.canedit = hasPermission("layout_change_dashboardlayout")
		this.candelete = hasPermission("layout_delete_dashboardlayout")

		this.loading = true
		this.errored = false
		this.errormsg = null

		await this.getUserAccount()

		if (this.errored) {
			this.loading = false
			return
		}

		await Promise.all([
			this.getGroups(),
			this.getChartsList(),
			this.getLayouts(),
		])

		if (!this.errored) {
			this.loading = false
		}

		setTimeout(() => {
			this.chartsVisible = true
		}, 10)
	},
	methods: {
		// a creation answers {error}, an update the DRF field errors, a refusal {detail}
		_apiError(e) {
			const data = e?.response?.data
			if (data?.error) return data.error
			if (data?.detail) return data.detail
			if (data && typeof data === "object") {
				const messages = Object.values(data).flat().filter((item) => typeof item === "string")
				if (messages.length) return messages.join(" ")
			}
			return e?.message || String(e)
		},

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
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getUserAccount() {
			try {
				const data = await this.$api.generic.get("myaccount/")
				this.userid = data?.id
				this.groupids = data?.groups || []

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
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
						this.errormsg = this._apiError(r.reason)
						this.errored = true
					}
				})

				this.groups.sort((a, b) => (a.text || "").localeCompare(b.text || ""))

				if (!this.errored) {
					this.errormsg = null
					this.errored = false
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getLayouts() {
			this.layouts = []
			try {
				const data = await this.$api.generic.get("dashboard/layout/")
				const layouts = Array.isArray(data) ? data : (data?.results || [])

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
				} else if (!this.layouts[this.activeLayout]) {
					this.activeLayout = 0
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		// the author is set by the server, only the charts are sent
		async saveDashboard() {
			this.loadingsave = true
			try {
				await this.$api.generic.patch(
					`dashboard/layout/${this.activedashboard.id}/`,
					{ layout: this.activedashboard.layout }
				)
				this.edit = false
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loadingsave = false
			}
		},

		openForm(edit) {
			const dashboard = edit ? this.activedashboard : null
			this.editingid = edit ? dashboard.id : null
			this.form = {
				name: dashboard?.name || null,
				visibility: dashboard?.visibility || "public",
				groups: dashboard?.groups || [],
				allow_group_modification: dashboard?.allow_group_modification || false,
			}
			this.formerror = false
			this.formerrormsg = null
			this.formmodal = true
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingform = true
			this.formerror = false
			this.formerrormsg = null

			const payload = {
				name: this.form.name,
				visibility: this.form.visibility,
				groups: this.form.visibility === "private_group" ? this.form.groups : [],
				allow_group_modification:
					this.form.visibility === "private_group"
					&& this.form.allow_group_modification,
			}

			try {
				if (this.editingid) {
					const updated = await this.$api.generic.patch(
						`dashboard/layout/${this.editingid}/`, payload
					)
					Object.assign(this.activedashboard, updated)
					this.optlayouts[this.activeLayout].text = updated.name
				} else {
					// a copy of the charts on screen, rearranged or not
					const created = await this.$api.generic.post("dashboard/layout/", {
						...payload,
						layout: this.activedashboard.layout,
					})
					this.edit = false
					await this.getLayouts()
					const index = this.layouts.findIndex((layout) => layout.id === created.id)
					if (index !== -1) this.activeLayout = index
				}
				this.formmodal = false
			} catch (e) {
				this.formerrormsg = this._apiError(e)
				this.formerror = true
			} finally {
				this.loadingform = false
			}
		},

		openDelete() {
			this.deleteerror = false
			this.deleteerrormsg = null
			this.deletemodal = true
		},

		async onDelete() {
			this.loadingdelete = true
			try {
				await this.$api.generic.delete(`dashboard/layout/${this.activedashboard.id}/`)
				this.deletemodal = false
				this.activeLayout = 0
				await this.reloadDashboard()
			} catch (e) {
				this.deleteerrormsg = this._apiError(e)
				this.deleteerror = true
			} finally {
				this.loadingdelete = false
			}
		},

		onActiveLayoutChanged() {
			this.loadingchart = true
			localStorage.setItem('active_layout', this.activeLayout)
			this.loadingchart = false
		},

		// also the way out of the customization, the charts come back as saved
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
			let index = this.activedashboard.layout.findIndex(item => item.i === i)

			if (index > -1) {
				this.activedashboard.layout.splice(index, 1)
				for (const layout of this.activedashboard.layout) {
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
			const index = this.activedashboard.layout.length

			this.activedashboard.layout.push(
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
	}
}
</script>