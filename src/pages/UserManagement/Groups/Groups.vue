<template>
	<div id="Groups">
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
				<AddGroupModal
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
import AddGroupModal from '@/components/Modals/AddItem/AddGroupModal';

export default {
	name: "Groups",
	components: {
		Loader,
		AddGroupModal
	},
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			rowdataUserPermissionGroup: [],
			rowdataUserPermissionUser: [],
			canadd: false,
			canedit: false,
			candelete: false
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
								if(this.rowdataUserPermissionUser.indexOf(12) !== -1 
								|| this.rowdataUserPermissionGroup.indexOf(12) !== -1) {
									Axios.get(process.env.VUE_APP_API_ROUTE+"groups/", { headers: header })
										.then(() => {
											this.errorMsg = null
											this.errored = false
											if(this.rowdataUserPermissionUser.indexOf(9) !== -1 
											|| this.rowdataUserPermissionGroup.indexOf(9) !== -1) {
												this.canadd = true
											}
											if(this.rowdataUserPermissionUser.indexOf(10) !== -1 
											|| this.rowdataUserPermissionGroup.indexOf(10) !== -1) {
												this.canedit = true
											}
											if(this.rowdataUserPermissionUser.indexOf(11) !== -1 
											|| this.rowdataUserPermissionGroup.indexOf(11) !== -1) {
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
					})
				})
			})
			.catch(e => {
				this.errorMsg = e
				this.errored = true
			})
	}
}
</script>