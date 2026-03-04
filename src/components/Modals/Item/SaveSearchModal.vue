<template>
	<div id="save-search-modal">
		<div 
			v-if="!update"
			:class="(!navbar) ? 'page-header d-print-none' : 'shortcut'"
		>
			<div 
				:class="(!navbar) ? 'col-auto ms-auto div-save-search' : ''"
				align="right"
			>
				<b-button
					v-if="!navbar"
					:title="$t('search.savemysearch')"
					class="btn btn-teal btn-save-search"
					@click="
						loadData(),
						getMyInfo()
					"
				>
					<font-awesome-icon 
						:icon="['far', 'floppy-disk']"
						size="lg"
					/>
				</b-button>
				<b-button
					:title="$t('search.usesavedsearch')"
					class="btn btn-yellow"
					@click="getMySearches()"
				>
					<font-awesome-icon 
						:icon="['far', 'star']"
						size="lg"
					/>
				</b-button>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('search.editsavesearch')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			v-if="!update"
			id="use-savesearch" 
			v-model="usesavesearchmodal"
			:title="$t('search.usesavedsearch')"
			hide-footer
			modal-class="custom-modal"
			size="lg"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('search.usesavedsearch') }}
				</h5>
				<b-button 
					:title="$t('search.gotosavedsearches')"
					class="btn btn-ghost-yellow ocs-auto"
					@click="goToSavedSearches()"
				>
					<font-awesome-icon 
						:icon="['fas', 'gear']"
						size="1x"
					/>
				</b-button>
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
			<Datatable
				v-if="!loading"
				id="savesearch-datatable"
				:rowdata="rowsavesearch"
				:usecheckbox="false"
				:canexport="false"
				:canshowhide="false"
				:rowheader="rowsavesearchheader"
				:canrefresh="false"
				:isbusy="isbusy"
				title="usesavesearch"
				translationkey="search."
				@useSaveSearch="useSaveSearch"
			/>
		</b-modal>
		<b-modal 
			id="savesearchmodal" 
			v-model="savesearchmodal"
			:title="(!update) ? $t('search.savemysearch') : $t('search.editsavesearch')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('search.savemysearch') : $t('search.editsavesearch') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="createerror"
						:icon="['fas', 'xmark']"
						color="red"
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
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row v-if="!update">
					<b-col>
						<b-form-group
							:label="$t('search.action')" 
							label-for="action"
						>
							<v-select
								id="action"
								v-model="searchaction" 
								:options="optactions" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								@option:selected="getMySearches(searchaction)"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="searchaction == 'update'">
					<b-col>
						<b-form-group
							:label="$t('search.selectsavedsearch')" 
							label-for="savedsearch"
						>
							<v-select
								id="savedsearch"
								v-model="updatesearchid" 
								:options="optsearch" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								@option:selected="setSearchInfo(updatesearchid)"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('search.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="savesearch.name"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('search.description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="savesearch.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('search.visibility')" 
							label-for="visibility"
						>
							<v-select
								id="visibility"
								v-model="savesearch.visibility" 
								:options="optvisibility" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="savesearch.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('search.groups')" 
							label-for="groups"
						>
							<v-select 
								v-model="savesearch.groups"
								:options="groups"
								:reduce="text => text.value"
								label="text"
								multiple
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="savesearch.visibility == 'private_group'">
					<b-col>
						<b-form-group
							class="allow-group-modification"
							:label="$t('search.allow_group_modification')" 
							label-for="allow_group_modification"
						>
							<label class="form-check form-switch">
								<input 
									v-model="savesearch.allow_group_modification"
									class="form-check-input"
									type="checkbox"
								>
							</label>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "SaveSearchModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
		rowsearch: { type: [Array, Object], default: () => [] },
		navbar: { type: Boolean, default: false }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			savesearch: {
				search: {},
				visibility: "private_personal",
				name: null,
				description: null,
				allow_group_modification: false,
				user: null,
				groups: []
			},
			searchaction: "create",
			optvisibility: [
				{ value: "public", text: this.$t("search.public") },
				{ value: "private_personal", text: this.$t("search.private_personal") },
				{ value: "private_group", text: this.$t("search.private_group") }
			],
			optactions : [
				{ value: "create", text: this.$t("search.create") },
				{ value: "update", text: this.$t("search.update") }
			],
			optsearch: [],
			groups : [],
			rowuser : [],
			savedsearches: [],
			rowsavesearchheader: [],
			rowsavesearch: [],
			updatesearchid: null,
			updatesearch: [],
			usesavesearchmodal: false,
			savesearchmodal: false,
			
			isbusy: true,
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.savesearchmodal = false
				this.createwithsuccess = false
				this.savesearch = {
					search: {},
					visibility: "private_personal",
					name: null,
					description: null,
					allow_group_modification: false,
					user: null,
					groups: []
				}
				if(this.update) {
					this.$emit("reloadDatatable")
				}
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.savesearchmodal = true
			this.savesearch = {
				search: {},
				visibility: "private_personal",
				name: null,
				description: null,
				allow_group_modification: false,
				user: null,
				groups: [],
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getSavedSearch(id)
			}
		},

		async getSavedSearch(id) {
			try {
				const data = await this.$api.generic.get(`search/save/${id}/`)
				this.savesearch = data

				this.errormsg = null
				this.errored = false

				await this.getMyInfo()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getMySearches(searchaction) {
			this.isbusy = true

			if (searchaction === undefined) {
				this.usesavesearchmodal = true
				this.loading = true
			}

			this.rowsavesearch = []
			this.optsearch = []
			this.updatesearch = []
			this.savedsearches = this.savedsearches || {}

			try {
				const data = await this.$api.generic.get("search/save/")

				if (searchaction === undefined) {
					this.rowsavesearchheader = ["searchname", "description"]

					for (const savedsearch of data) {
						this.savedsearches[savedsearch.id] = savedsearch.search
						this.rowsavesearch.push({
							id: savedsearch.id,
							searchname: savedsearch.name,
							description: savedsearch.description,
						})
					}
				} else {
					for (const savedsearch of data) {
						this.optsearch.push({
							value: savedsearch.id,
							text: savedsearch.name,
						})

						this.updatesearch[savedsearch.id] = savedsearch
					}
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				if (searchaction === undefined) {
					this.loading = false
					this.isbusy = false
				}
			}
		},

		setSearchInfo(id) {
			this.loading = true
			this.savesearch = this.updatesearch[id]
			this.loading = false
		},

		async getMyInfo() {
			this.loading = true
			this.savesearchmodal = true

			this.optvisibility.sort((a, b) =>
				a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)
			)

			try {
				const data = await this.$api.generic.get("myaccount/")
				this.rowuser = data

				this.errormsg = null
				this.errored = false

				if (this.rowuser.groups) {
					await this.getGroups(this.rowuser.groups)
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getGroups(groups) {
			this.groups = []

			try {
				const results = await Promise.all(
					(groups || []).map((groupId) => this.$api.generic.get(`groups/${groupId}/`))
				)

				this.groups = results
					.map((g) => ({ value: g.id, text: g.name }))
					.sort((a, b) => (a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				const basePayload = {
					...this.savesearch,
				}

				if (basePayload.visibility !== "private_group") {
					basePayload.groups = []
					basePayload.allow_group_modification = false
				}

				if (!this.update) {
					basePayload.user = this.rowuser.id
					basePayload.search = this.rowsearch

					if (this.searchaction === "create") {
						await this.$api.generic.post("search/save/", basePayload)
					} else {
						await this.$api.generic.patch(`search/save/${basePayload.id}/`, basePayload)
					}
				} else {
					const { search: _search, user: _user, ...payload } = basePayload

					await this.$api.generic.patch(`search/save/${this.savesearch.id}/`, payload)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},

		useSaveSearch(id) {
			this.$emit("useSaveSearch", this.savedsearches[id])
			this.usesavesearchmodal = false
		},

		goToSavedSearches() {
			this.$router.push("/inventory/savedsearch")
			this.usesavesearchmodal = false
		},
	}
}
</script>