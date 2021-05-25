<template>
	<div id="AddUserModal">
		<b-button 
			v-b-modal.add-user
			:title="$t('adduser')"
			variant="success"
			class="add-button"
		>
			<font-awesome-icon 
				:icon="['fas', 'plus']"/>
		</b-button>

		<b-modal 
			id="add-user" 
			:title="$t('adduser')"
			hide-footer
		>
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
							/>
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
							/>
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
							/>
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
							/>
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
					<b-col>
						<h4>{{ $t('user_permissions') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col
						v-for="permission in permissions"
						:key="permission.id"
						cols="4"
					>
						<b-form-checkbox
							:id="permission.code"
							v-model="row.user_permissions"
							:name="permission.code"
							:value="permission.id"
							unchecked
						>
							{{ permission.name }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<b-row>
					<b-col align-self="start"/>
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ $t('add') }}
						</b-button>
					</b-col>
					<b-col align-self="end"/>
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../i18n'

export default {
	name: 'AddUserModal',
	data() {
		return {
			row: {
				username: null,
				password: null,
				email: null,
				first_name: null,
				last_name: null,
				is_staff: false,
				groups: [],
				user_permissions: []
			},
			groups: [],
			permissions: []
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

		Axios.get("http://172.18.26.12:8000/groups/", { headers: header })
			.then(response => {
				response.data.forEach(groupDetails => {
					this.groups.push({
						id: groupDetails.id,
						code: "group_"+groupDetails.id,
						name: groupDetails.name
					})
				})
			})

		Axios.get("http://172.18.26.12:8000/permissions", { headers: header })
			.then(response => {
				response.data.forEach(permissionDetails => {
					this.permissions.push({
						id: permissionDetails.id,
						code: "permission_"+permissionDetails.id,
						name: i18n.t(permissionDetails.codename)
					})
				})
			})
	},
	methods: {
		onSubmit(event) {
			event.preventDefault()
		}
	}
}
</script>
