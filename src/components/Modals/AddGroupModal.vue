<template>
	<div id="AddGroupModal">
		<section v-if="successed">
			<b-alert 
				:show="!!succesMsg" 
				class="alert-sm" 
				variant="success"
			>
				{{ $t('success_saved') }}
			</b-alert>
		</section>

		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<b-button 
			v-b-modal.add-group
			:title="$t('addgroup')"
			variant="success"
			class="add-button"
		>
			<font-awesome-icon 
				:icon="['fas', 'plus']"/>
		</b-button>

		<b-modal 
			id="add-group" 
			:title="$t('addgroup')"
			hide-footer
		>
			<b-form
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<h4>{{ $t('group_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('name')" 
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
							v-model="row.permissions"
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
				name: null,
				permissions: []
			},
			permissions: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

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
			
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			Axios.post("http://172.18.26.12:8000/groups/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-group')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-group')
				})
		}
	}
}
</script>
