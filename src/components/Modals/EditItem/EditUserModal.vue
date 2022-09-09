<template>
	<div id="edit-user-modal">
		<button 
			v-b-modal="idModal"
			:title="$t('edituser')"
			class="btn btn-ghost-dark"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idModal" 
			:title="$t('edituser')"
			hide-footer
			modal-class="custom-modal modal-blur"
			size="xl"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('edituser') }}
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
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<h4>{{ $t('user_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('username')" 
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
							:label="$t('password')" 
							label-for="password"
						>
							<b-form-input
								id="password"
								v-model="row.password"
								type="password"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('email')" 
							label-for="email"
						>
							<b-form-input
								id="email"
								v-model="row.email"
								required
							>
								{{ row.email }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group 
							:label="$t('first_name')" 
							label-for="first_name"
						>
							<b-form-input
								id="first_name"
								v-model="row.first_name"
								required
							>
								{{ row.first_name }}
							</b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('last_name')" 
							label-for="last_name"
						>
							<b-form-input
								id="last_name"
								v-model="row.last_name"
								required
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
							{{ $t('is_staff') }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<h4>{{ $t('groups') }}</h4>
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
							{{ $t('save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
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
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'edit-user'+this.id
		}
	},
	mounted() {
		this.getUser()
		this.getGroups()		
	},
	methods: {
		// Get user
		getUser() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			Axios.get(process.env.VUE_APP_API_ROUTE+"users/"+this.id+"/", { headers: header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		// Get groups
		getGroups() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			Axios.get(process.env.VUE_APP_API_ROUTE+"groups/", { headers: header })
				.then(response => {
					response.data.forEach(groupDetails => {
						this.groups.push({
							id: groupDetails.id,
							code: "group_"+groupDetails.id,
							name: groupDetails.name
						})
					})
				})
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			Axios.put(process.env.VUE_APP_API_ROUTE+"users/"+this.row.id+"/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-user'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-user'+this.row.id)
				})
		}
	}
}
</script>