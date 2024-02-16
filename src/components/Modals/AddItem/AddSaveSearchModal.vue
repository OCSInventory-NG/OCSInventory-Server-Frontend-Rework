<template>
	<div id="add-save-search-modal">
		<div 
			class="col-auto ms-auto div-save-search" 
			align="right"
		>
			<b-button
				v-b-modal.add-savesearch
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
				v-b-modal.use-savesearch
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
			:title="$t('search.usesavedsearch')"
			hide-footer
			modal-class="custom-modal modal-blur"
			size="lg"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('search.usesavedsearch') }}
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
			:title="$t('search.savemysearch')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios';
import i18n from '@/i18n';
import Datatable from '@/components/Datatable/Datatable';
import Alert from '@/components/Alert/Alert';

export default {
	name: "AddSaveSearchModal",
	components: { Datatable, Alert },
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
			optvisibility: [
				{ value: "public", text: i18n.t("search.public") },
				{ value: "private_personal", text: i18n.t("search.private_personal") },
				{ value: "private_group", text: i18n.t("search.private_group") }
			],
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.$bvModal.hide('add-savesearch')
				this.createwithsuccess = false
			}, 1000)
		}
	},
	methods: {
		getMySearches() {
			this.loading = true
			this.rowsavesearch = []
			Axios.get(process.env.VUE_APP_API_ROUTE+"search/save/", { headers: this.header })
				.then(response => {
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
					this.errorMsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getMyInfo() {
			this.loading = true
			this.optvisibility.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
			Axios.get(process.env.VUE_APP_API_ROUTE+"myaccount/", { headers: this.header })
				.then(response => {
					this.rowuser = response.data
					this.errorMsg = null
					this.errored = false
					if(this.rowuser.groups) {
						this.getGroups(this.rowuser.groups)
					}
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getGroups(groups) {
			this.groups = []
			for (const group of groups) {
				Axios.get(process.env.VUE_APP_API_ROUTE+"groups/"+group, { headers: this.header })
					.then(response => {
						this.groups.push({
							value: response.data.id,
							text: response.data.name
						})
					})
					.catch(e => {
						this.errorMsg = e.message
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

			Axios.post(process.env.VUE_APP_API_ROUTE+"search/save/", this.savesearch, { headers: this.header })
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
		},
		useSaveSearch(id) {
			this.$emit('useSaveSearch', this.savedsearches[id])
			this.$bvModal.hide('use-savesearch')
		}
	}
}
</script>