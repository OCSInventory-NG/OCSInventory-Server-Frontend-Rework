<template>
	<div id="asset-group-modal">
		<div
			v-if="!update"
			class="col-auto ms-auto" 
			align="center"
		>
			<b-button
				:title="$t('assetgroup.saveasgroup')"
				class="d-none d-sm-inline-block btn-teal"
				@click="getUserInfo()"
			>
				<font-awesome-icon 
					:icon="['fas', 'plus']"
				/>
				{{ $t('assetgroup.group') }}
			</b-button>
		</div>
		<div v-else>
			<button 
				:title="$t('assetgroup.editassetgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="assetgroupmodal" 
			v-model="assetgroupmodal"
			:title="(!update) ? $t('assetgroup.saveasgroup') : $t('assetgroup.editassetgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('assetgroup.saveasgroup') : $t('assetgroup.editassetgroup') }}
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
							:label="$t('assetgroup.action')" 
							label-for="action"
						>
							<v-select 
								id="action"
								v-model="groupaction"
								:options="optactions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								required
								@input="getMyAssetGroups()"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="groupaction == 'update'">
					<b-col>
						<b-form-group
							:label="$t('assetgroup.selectassetgroup')" 
							label-for="assetgroups"
						>
							<v-select 
								id="assetgroups"
								v-model="updategroupid"
								:options="optgroup"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								required
								@input="setAssetGroupInfo(updategroupid)"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('assetgroup.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="rowgroup.name"
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
								v-model="rowgroup.description"
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
									v-model="rowgroup.is_dynamic"
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
								v-model="rowgroup.visibility"
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
				<b-row v-if="rowgroup.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('assetgroup.groups')" 
							label-for="groups"
						>
							<v-select 
								v-model="rowgroup.groups"
								:options="groups"
								:reduce="text => text.value"
								label="text"
								multiple
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="rowgroup.visibility == 'private_group'">
					<b-col>
						<b-form-group
							:label="$t('assetgroup.allow_group_modification')" 
							label-for="allow_group_modification"
						>
							<label class="form-check form-switch">
								<input 
									v-model="rowgroup.allow_group_modification"
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
	name: "AssetGroupModal",
	props: {
		search: { type: Array, default: null },
		assetrow: { type: Array, default: null},
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			rowgroup: {
				name: null,
				description: null,
				search: [],
				is_dynamic: true,
				assets: [],
				visibility: "public",
				allow_group_modification: false,
				user: null,
				groups: []
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			assetgroupmodal: false,
			optvisibility: [
				{ value: "public", text: this.$t("assetgroup.public") },
				{ value: "private_personal", text: this.$t("assetgroup.private_personal") },
				{ value: "private_group", text: this.$t("assetgroup.private_group") }
			],
			optactions : [
				{ value: "create", text: this.$t("assetgroup.create") },
				{ value: "update", text: this.$t("assetgroup.update") }
			],
			optgroup: [],
			user: [],
			groups: [],
			groupaction: "create",
			updategroup: [],
			updategroupid: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.assetgroupmodal = false
				this.createwithsuccess = false
				if(this.update) {
					this.$emit("reloadDatatable")
				}
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.assetgroupmodal = true
			this.getAssetGroupInfo(id)
		},
		getAssetGroupInfo() {
			this.loading = true
			this.assetgroupmodal = true

			axios.get(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/"+this.id, { headers: this.header })
				.then(response => {
					delete response.data.search
					delete response.data.assets

					this.rowgroup = response.data
					
					this.errormsg = null
					this.errored = false
					this.getUserName()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getUserName() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"users/"+this.rowgroup.user, { headers: this.header })
				.then(response => {
					this.user = response.data
					if(response.data.first_name != "") {
						this.rowgroup.user = response.data.last_name.concat(" ", response.data.first_name)
					} else {
						this.rowgroup.user = response.data.username
					}
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
			this.getGroups(this.rowgroup.groups)
		},
		getUserInfo() {
			this.loading = true
			this.optvisibility.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))
			this.assetgroupmodal = true
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"myaccount/", { headers: this.header })
				.then(response => {
					this.user = response.data
					this.errormsg = null
					this.errored = false
					if(this.user.groups) {
						this.getGroups(this.user.groups)
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
			this.loading = false
		},
		getMyAssetGroups() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/", { headers: this.header })
				.then(response => {
					for (const assetgroup of response.data) {
						this.optgroup.push({
							value: assetgroup.id,
							text: assetgroup.name
						})

						this.updategroup[assetgroup.id] = assetgroup
					}
					
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		setAssetGroupInfo(id) {
			this.loading = true
			this.rowgroup = this.updategroup[id]
			this.loading = false 
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(!this.update) {
				this.rowgroup.assets = this.assetrow
				this.rowgroup.search = this.search
				this.rowgroup.user = this.user.id

				if(this.rowgroup.visibility != "private_group") {
					this.rowgroup.groups = []
					this.rowgroup.allow_group_modification = false
				}

				if(this.groupaction == "create") {
					axios.post(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/", this.rowgroup, { headers: this.header })
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
					axios.patch(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/"+this.rowgroup.id+"/", this.rowgroup, 
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
			} else {
				this.rowgroup.user = this.user.id

				if(this.rowgroup.visibility != "private_group") {
					this.rowgroup.groups = []
					this.rowgroup.allow_group_modification = false
				}

				axios.patch(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/"+this.rowgroup.id+"/", this.rowgroup, 
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
}
</script>