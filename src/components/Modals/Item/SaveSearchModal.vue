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
			modal-class="custom-modal modal-blur"
			size="lg"
			scrollable
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
			modal-class="custom-modal modal-blur"
			scrollable
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
import axios from 'axios'

export default {
	name: "SaveSearchModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
		rowsearch: { type: Array, default: null },
		navbar: { type: Boolean, default: false }
	},
	data() {
		return {
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
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			usesavesearchmodal: false,
			savesearchmodal: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
		loadData(id) {
			this.savesearchmodal = true
			this.savesearch = {
				search: {},
				visibility: "private_personal",
				name: null,
				description: null,
				allow_group_modification: false,
				user: null,
				groups: []
			}
			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null

			if (id) {
				this.loading = true
				this.getSavedSearch(id)
			}
		},
		async getSavedSearch(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"search/save/"+id+"/", { headers: this.header })
				.then(response => {
					this.savesearch = response.data
					this.errormsg = null
					this.errored = false
					this.getMyInfo()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getMySearches(searchaction) {
			if(searchaction == undefined) {
				this.usesavesearchmodal = true
				this.loading = true
			}
			
			this.rowsavesearch = []
			this.optsearch = []
			this.updatesearch = []

			await axios.get(this.$config.BACKEND_API_ROUTE+"search/save/", { headers: this.header })
				.then(response => {
					if(searchaction == undefined) {
						this.rowsavesearchheader = [
							"searchname", "description"
						]
						for (const savedsearch of response.data) {
							this.savedsearches[savedsearch.id] = savedsearch.search
							this.rowsavesearch.push({
								id: savedsearch.id,
								searchname: savedsearch.name,
								description: savedsearch.description
							})
						}
					} else {
						for (const savedsearch of response.data) {
							this.optsearch.push({
								value: savedsearch.id,
								text: savedsearch.name
							})

							this.updatesearch[savedsearch.id] = savedsearch
						}
					}
					
					this.errormsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		setSearchInfo(id) {
			this.loading = true
			this.savesearch = this.updatesearch[id]
			this.loading = false 
		},
		async getMyInfo() {
			this.loading = true
			this.savesearchmodal = true
			this.optvisibility.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
			await axios.get(this.$config.BACKEND_API_ROUTE+"myaccount/", { headers: this.header })
				.then(response => {
					this.rowuser = response.data
					this.errormsg = null
					this.errored = false
					if(this.rowuser.groups) {
						this.getGroups(this.rowuser.groups)
					}
					this.loading = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getGroups(groups) {
			this.groups = []
			for (const group of groups) {
				await axios.get(this.$config.BACKEND_API_ROUTE+"groups/"+group+"/", { headers: this.header })
					.then(response => {
						this.groups.push({
							value: response.data.id,
							text: response.data.name
						})
					})
					.catch(e => {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
					})
			}
			this.groups.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.savesearch.visibility != "private_group") {
				this.savesearch.groups = []
				this.savesearch.allow_group_modification = false
			}

			if(!this.update) {
				this.savesearch.user = this.rowuser.id
				this.savesearch.search = this.rowsearch

				if(this.searchaction == "create") {
					axios.post(this.$config.BACKEND_API_ROUTE+"search/save/", this.savesearch, { headers: this.header })
						.then(() => {
							this.createwithsuccess = true
							this.createerrormsg = null
							this.createerror = false
						})
						.catch(e => {
							this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
							this.createerror = true
							this.createwithsuccess = false
						})
						.finally(() => { this.loadingcreate = false })
				} else {
					axios.patch(this.$config.BACKEND_API_ROUTE+"search/save/"+this.savesearch.id+"/", this.savesearch, 
						{ headers: this.header })
						.then(() => {
							this.createwithsuccess = true
							this.createerrormsg = null
							this.createerror = false
						})
						.catch(e => {
							this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
							this.createerror = true
							this.createwithsuccess = false
						})
						.finally(() => { this.loadingcreate = false })
				}
			} else {
				delete this.savesearch.search
				delete this.savesearch.user

				axios.patch(this.$config.BACKEND_API_ROUTE+"search/save/"+this.savesearch.id+"/", this.savesearch,
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			}			
		},
		useSaveSearch(id) {
			this.$emit('useSaveSearch', this.savedsearches[id])
			this.usesavesearchmodal = false
		},
		goToSavedSearches(){
			this.$router.push('/inventory/savedsearch');
			this.usesavesearchmodal = false
		}
	}
}
</script>