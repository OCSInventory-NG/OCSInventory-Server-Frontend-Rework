<template>
	<div id="edit-assetgroup-modal">
		<button 
			:title="$t('assetgroup.editassetgroup')"
			class="btn btn-ghost-dark"
			@click="getAssetGroupInfo()"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>
		<b-modal 
			:id="'edit-assetgroup.'+id"
			v-model="editassetgroup"
			:title="$t('assetgroup.editassetgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('assetgroup.editassetgroup') }}
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
							:label="$t('assetgroup.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="groupinfo.name"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('assetgroup.description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="groupinfo.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('assetgroup.is_dynamic')" 
							label-for="is_dynamic"
						>
							<label class="form-check form-switch">
								<input 
									v-model="groupinfo.is_dynamic"
									class="form-check-input"
									type="checkbox"
								>
							</label>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('assetgroup.visibility')" 
							label-for="visibility"
						>
							<v-select 
								v-model="groupinfo.visibility"
								:options="optvisibility"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="groupinfo.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('assetgroup.groups')" 
							label-for="groups"
						>
							<v-select 
								v-model="groupinfo.groups"
								:options="groups"
								:reduce="text => text.value"
								label="text"
								multiple
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="groupinfo.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('assetgroup.allow_group_modification')" 
							label-for="allow_group_modification"
						>
							<label class="form-check form-switch">
								<input 
									v-model="groupinfo.allow_group_modification"
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
import Axios from 'axios'

export default {
	name: 'EditAssetGroupModal',
	props: {
		id: { type: Number, required: true },
	},
	data() {
		return {
			loading: true,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			loadingcreate: false,
			editassetgroup: false,
			groupinfo: {
				name: null,
				description: null,
				is_dynamic: true,
				visibility: "public",
				allow_group_modification: false,
				user: null,
				groups: []
			},
			optvisibility: [
				{ value: "public", text: this.$t("assetgroup.public") },
				{ value: "private_personal", text: this.$t("assetgroup.private_personal") },
				{ value: "private_group", text: this.$t("assetgroup.private_group") }
			],
			user: [],
			groups: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editassetgroup = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		getAssetGroupInfo() {
			this.loading = true
			this.editassetgroup = true

			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/"+this.id, { headers: this.header })
				.then(response => {
					delete response.data.search
					delete response.data.assets

					this.groupinfo = response.data
					
					this.createerrormsg = null
					this.createerror = false
					this.getUserName()
				})
				.catch(e => {
					this.createerrormsg = e.message
					this.createerror = true
				})
		},
		getUserName() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"users/"+this.groupinfo.user, { headers: this.header })
				.then(response => {
					this.user = response.data
					if(response.data.first_name != "") {
						this.groupinfo.user = response.data.last_name.concat(" ", response.data.first_name)
					} else {
						this.groupinfo.user = response.data.username
					}
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
			this.getGroups()
		},
		getGroups() {
			this.groups = []
			if(this.groupinfo.groups) {
				for (const group of this.groupinfo.groups) {
					this.loading = true
					Axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/"+group, { headers: this.header })
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
						.finally(() => this.loading = false)
				}
			}

			this.loading = false
		},
		onSubmit(event) {
			event.preventDefault();
			this.loadingcreate = true

			this.groupinfo.user = this.user.id

			if(this.groupinfo.visibility != "private_group") {
				this.groupinfo.groups = []
				this.groupinfo.allow_group_modification = false
			}

			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/"+this.groupinfo.id+"/", this.groupinfo, 
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
	}
}
</script>