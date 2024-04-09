<template>
	<div id="edit-user-modal">
		<button 
			:title="$t('user.edituser')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idModal"
			v-model="edituser"
			:title="$t('user.edituser')"
			hide-footer
			modal-class="custom-modal modal-blur"
			size="xl"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('user.edituser') }}
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
						<h4>{{ $t('user.user_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.username')" 
							label-for="username"
						>
							<b-form-input
								id="username"
								v-model="row.username"
								required
							>
								{{ row.username }}
							</b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('user.password')" 
							label-for="password"
						>
							<b-form-input
								id="password"
								v-model="row.password"
								type="password"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.email')" 
							label-for="email"
						>
							<b-form-input
								id="email"
								v-model="row.email"
							>
								{{ row.email }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group 
							:label="$t('user.first_name')" 
							label-for="first_name"
						>
							<b-form-input
								id="first_name"
								v-model="row.first_name"
							>
								{{ row.first_name }}
							</b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('user.last_name')" 
							label-for="last_name"
						>
							<b-form-input
								id="last_name"
								v-model="row.last_name"
							>
								{{ row.last_name }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-checkbox
							id="is_staff"
							v-model="row.is_staff"
							name="is_staff"
							value="true"
							unchecked-value="false"
						>
							{{ $t('user.is_staff') }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<h4>{{ $t('title.groups') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col
						v-for="group in groups"
						:key="group.id"
						cols="4"
					>
						<b-form-checkbox
							:id="group.code"
							v-model="row.groups"
							:name="group.code"
							:value="group.id"
							unchecked
						>
							{{ group.name }}
						</b-form-checkbox>
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
	name: 'EditUserModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				username: null,
				password: null,
				email: null,
				first_name: null,
				last_name: null,
				is_staff: false,
				groups: []
			},
			groups: [],
			errorMsg: null,
			errored: false,
			idModal: 'edit-user'+this.id,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			edituser: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.edituser = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.edituser = true
			this.getUser(id)
		},
		// Get user
		getUser(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"users/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.getGroups()
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		// Get groups
		getGroups() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/", { headers: this.header })
				.then(response => {
					this.groups = []
					response.data.forEach(groupDetails => {
						this.groups.push({
							id: groupDetails.id,
							code: "group_"+groupDetails.id,
							name: groupDetails.name
						})
					})

					this.loading = false
				})
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.row.password == "") {
				delete this.row.password
			}

			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"users/"+this.row.id+"/", this.row, { headers: this.header })
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
</script>