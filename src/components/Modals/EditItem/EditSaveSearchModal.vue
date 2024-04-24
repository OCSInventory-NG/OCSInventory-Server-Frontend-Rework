<template lang="">
	<div id="edit-save-search-modal">
		<button 
			:title="$t('search.editsavesearch')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="editsavesearch"
			:title="$t('search.editsavesearch')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('search.editsavesearch') }}
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
								v-model="row.name"
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
								v-model="row.description"
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
								v-model="row.visibility"
								:options="optvisibility"
								class="mb-3 form-select form-control"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="row.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('search.groups')" 
							label-for="groups"
						>
							<v-select 
								v-model="row.groups"
								:options="groups"
								:reduce="text => text.value"
								label="text"
								multiple
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="row.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('search.allow_group_modification')" 
							label-for="allow_group_modification"
						>
							<label class="form-check form-switch">
								<input 
									v-model="row.allow_group_modification"
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
							{{ $t('generic.save') }}
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
	name: "EditSaveSearchModal",
	props: {
		id: { type: Number, default: null }
	},data() {
		return {
			row: {
				name: null,
				description: null,
				allow_group_modification: false,
				groups: [],
				visibility: "public"
			},
			rowuser: [],
			optvisibility: [
				{ value: "public", text: this.$t("search.public") },
				{ value: "private_personal", text: this.$t("search.private_personal") },
				{ value: "private_group", text: this.$t("search.private_group") }
			],
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			editsavesearch: false,
			groups : [],
			idmodal: 'edit-savesearch.'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editsavesearch = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.editsavesearch = true
			this.getSavedSearch(id)
		},
		getSavedSearch(id) {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"search/save/"+id, { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
					this.getMyInfo()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getMyInfo() {
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
				this.loading = true
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
					.finally(() => { this.loading = false })
			}
			this.groups.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			delete this.row.search
			delete this.row.user
			
			axios.patch(import.meta.env.VITE_APP_API_ROUTE+"search/save/"+this.row.id+"/", this.row,
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
				.finally(() => this.loadingcreate = false)
		},
	}
}
</script>