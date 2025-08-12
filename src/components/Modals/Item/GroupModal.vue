<template>
	<div id="group-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('group.addgroup')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="groupmodal = !groupmodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('group.addgroup') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('group.editgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="groupmodal" 
			v-model="groupmodal"
			:title="(!update) ? $t('group.addgroup') : $t('group.editgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
			size="xl"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('group.addgroup') : $t('group.editgroup') }}
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
				<b-row>
					<b-col>
						<h4>{{ $t('group.group_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
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
						<h4>{{ $t('group.permissions') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<Matrix 
						:id="id"
						v-model="row.permissions"
						:rowtab="permissions"
						:rowlabel="permissionslabel"
						:rowpermissions="row.permissions"
						@permissions="row.permissions = $event"
					/>
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
	name: "GroupModal",
	props: {
		permissionsprop: { type: Array, default: null },
		permissionslabelprop: { type: Array, default: null },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				permissions: []
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			groupmodal: false,
			permissions: [],
			permissionslabel: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.groupmodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					permissions: []
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.permissions = this.permissionsprop
			this.permissionslabel = this.permissionslabelprop
			this.loading = false
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.groupmodal = true
			this.getPermissions(id)
		},
		async getPermissions(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"permissions/", { headers: this.header })
				.then(response => {
					var array = ["add_", "change_", "delete_", "view_"]
					var labeltmp = new Set()

					this.permissionslabel = []
					this.permissions = []

					response.data.forEach(permissionDetails => {
						array.forEach(type => {
							if(~permissionDetails.codename.indexOf(type)) {
								var permissionKey = permissionDetails.codename.replace(type, "")

								if(this.$te("permission." + permissionKey)) {
									var key = permissionKey + "_" + permissionDetails.content_type

									if(typeof this.permissions[key] === 'undefined') {
										this.permissions[key] = [{
											id: permissionDetails.id,
											code: "permission_" + permissionDetails.id,
											name: permissionDetails.codename,
											key: permissionKey,
											type: type.replace("_", "")
										}]
									} else {
										this.permissions[key].push({
											id: permissionDetails.id,
											code: "permission_" + permissionDetails.id,
											name: permissionDetails.codename,
											key: permissionKey,
											type: type.replace("_", "")
										})
									}


									labeltmp.add(key)
								}
							}
						})
					})
					labeltmp.forEach(label => {
						this.permissionslabel.push({
							id: label,
							trad: this.$t('permission.'+label.split("_")[0])
						})
					})

					this.permissionslabel.sort((a,b) => (a.trad > b.trad) ? 1 : ((b.trad > a.trad) ? -1 : 0))

					this.getGroup(id)
				})
		},
		async getGroup(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"groups/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"groups/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				axios.patch(this.$config.BACKEND_API_ROUTE+"groups/"+this.row.id+"/", this.row, { headers: this.header })
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
			}			
		}
	}
}
</script>