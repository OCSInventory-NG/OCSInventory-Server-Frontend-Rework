<template>
	<div id="add-save-search-modal">
		<div 
			class="col-auto ms-auto div-save-search" 
			align="right"
		>
			<b-button
				:title="$t('search.savemysearch')"
				class="btn btn-teal btn-save-search"
				@click="getMyInfo()"
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
		<b-modal 
			id="use-savesearch" 
			v-model="modaluse"
			:title="$t('search.usesavedsearch')"
			hide-footer
			modal-class="custom-modal modal-blur"
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
				title="usesavesearch"
				translationkey="search."
				@useSaveSearch="useSaveSearch"
			/>
		</b-modal>
		<b-modal 
			id="add-savesearch"
			v-model="modalsavesearch"
			:title="$t('search.savemysearch')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('search.savemysearch') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success" 
						label="Spinning"
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
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="createerror"
					:message="createerrormsg" 
					variant="danger"
				/>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('search.action')" 
							label-for="action"
						>
							<b-form-select
								id="action"
								v-model="searchaction"
								:options="optactions"
								class="mb-3 form-select form-control"
								required
								@input="getMySearches(true)"
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
							<b-form-select
								id="savedsearch"
								v-model="updatesearchid"
								:options="optsearch"
								class="mb-3 form-select form-control"
								required
								@input="setSearchInfo(updatesearchid)"
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
							<b-form-select
								id="visibility"
								v-model="savesearch.visibility"
								:options="optvisibility"
								class="mb-3 form-select form-control"
								required
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
							{{ $t('generic.add') }}
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
	name: "AddSaveSearchModal",
	props: {
		rowsearch: { type: Array, default: null }
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
			loading: true,
			loadingcreate: false,
			createwithsuccess: false,
			createerror: false,
			createerrormsg: null,
			updatesearchid: null,
			updatesearch: [],
			modaluse: false,
			modalsavesearch: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.modalsavesearch = false
				this.createwithsuccess = false
			}, 500)
		}
	},
	methods: {
		getMySearches(update = false) {
			if(!update) {
				this.modaluse = true
				this.loading = true
			}
			
			this.rowsavesearch = []
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"search/save/", { headers: this.header })
				.then(response => {
					if(!update) {
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
					this.errormsg = e.message
					this.errored = true
				})
		},
		setSearchInfo(id) {
			this.loading = true
			this.savesearch = this.updatesearch[id]
			this.loading = false 
		},
		getMyInfo() {
			this.modalsavesearch = true
			this.loading = true
			this.optvisibility.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"myaccount/", { headers: this.header })
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
					this.errormsg = e.message
					this.errored = true
				})
		},
		getGroups(groups) {
			this.groups = []
			for (const group of groups) {
				axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/"+group, { headers: this.header })
					.then(response => {
						this.groups.push({
							value: response.data.id,
							text: response.data.name
						})
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			}
			this.groups.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.savesearch.user = this.rowuser.id
			this.savesearch.search = this.rowsearch

			if(this.savesearch.visibility != "private_group") {
				this.savesearch.groups = []
				this.savesearch.allow_group_modification = false
			}

			if(this.searchaction == "create") {
				axios.post(import.meta.env.VITE_APP_API_ROUTE+"search/save/", this.savesearch, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => { this.loadingcreate = false })
			} else {
				axios.patch(import.meta.env.VITE_APP_API_ROUTE+"search/save/"+this.savesearch.id+"/", this.savesearch, 
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => { this.loadingcreate = false })
			}
			
		},
		useSaveSearch(id) {
			this.$emit('useSaveSearch', this.savedsearches[id])
			this.modaluse = false
		},
		goToSavedSearches(){
			this.$router.push('/inventory/savedsearch'); 
		},
	}
}
</script>