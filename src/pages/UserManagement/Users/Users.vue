<template>
	<div id="Users">
		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			>
				<AddUserModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios';
import i18n from '../../../i18n';
import Loader from '@/components/Loader/Loader';
import AddUserModal from '@/components/Modals/AddItem/AddUserModal';

export default {
	name: "Users",
	components: {
		Loader,
		AddUserModal
	},
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			rowdataUserPermissionGroup: [],
			rowdataUserPermissionUser: [],
			canedit: false,
			candelete: false,
			canadd: false,
			loading: true,
			errored: false,
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

		Axios.get(process.env.VUE_APP_API_ROUTE+"myaccount/", { headers: header })
			.then(response => {
				// Get permissions
				response.data.forEach(details => {
					this.rowdataUserPermissionUser = details.user_permissions
					details.groups.forEach(groups => {
						Axios.get(process.env.VUE_APP_API_ROUTE+"groups/"+groups, { headers: header })
							.then(groupresponse => {
								groupresponse.data.permissions.forEach(groups => {
									this.rowdataUserPermissionGroup[groups] = groups
								})
								if(this.rowdataUserPermissionUser.indexOf(16) !== -1 
								|| this.rowdataUserPermissionGroup.indexOf(16) !== -1) {
									Axios.get(process.env.VUE_APP_API_ROUTE+"users/", { headers: header })
										.then(response => {
											this.rowdata = response.data
											this.errorMsg = null
											this.errored = false
											if(this.rowdataUserPermissionUser.indexOf(13) !== -1 
											|| this.rowdataUserPermissionGroup.indexOf(13) !== -1) {
												this.canadd = true
											}
											if(this.rowdataUserPermissionUser.indexOf(14) !== -1 
											|| this.rowdataUserPermissionGroup.indexOf(14) !== -1) {
												this.canedit = true
											}
											if(this.rowdataUserPermissionUser.indexOf(15) !== -1 
											|| this.rowdataUserPermissionGroup.indexOf(15) !== -1) {
												this.candelete = true
											}
										})
										.catch(e => {
											this.errorMsg = e
											this.errored = true
										})
										.finally(() => this.loading = false)
								} else {
									this.errorMsg = this.errorMsg = i18n.t("dont_have_right_to_see")
									this.errored = true
								}
								this.errorMsg = null
								this.errored = false
							})
							.catch(e => {
								this.errorMsg = e
								this.errored = true
							})
							.finally(() => this.loading = false)
					})
				})
			})
			.catch(e => {
				this.errorMsg = e
				this.errored = true
			})
			.finally(() => this.loading = false)
	}
}
</script>