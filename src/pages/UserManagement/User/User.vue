<template>
	<div 
		id="user" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="user"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<div v-if="errored">
							<Alert 
								:message="errormsg" 
								variant="danger"
							/>
						</div>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<UserModal
								v-if="canadd"
								:groupsprop="groups"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="users-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="UserModal"
								title="users"
								translationkey="user."
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "User",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			rowdata: [],
			rowheader: [],
			errored: false,
			errormsg: null,
			loading: true,
			groups: [],
			groupsLabel: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_user")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_user")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_user")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_user")) {
				this.candelete = true
			}
			this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"users/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "user_permissions" && field != "password") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getGroups()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getGroups() {
			this.groups = []
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/", { headers: this.header })
				.then(response => {
					response.data.forEach(groupDetails => {
						this.groups.push({
							id: groupDetails.id,
							code: "group_"+groupDetails.id,
							name: groupDetails.name
						})
						this.groupsLabel[groupDetails.id] = groupDetails.name
					})
					this.getUsers()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getUsers() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"users/", { headers: this.header })
				.then(response => {
					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
					this.permissionsGroupsTreatment()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		permissionsGroupsTreatment() {
			this.rowdata.forEach(rowDetails => {
				var tmpGroups = []
				rowDetails.groups.forEach(groupsDetails => {
					tmpGroups.push(this.groupsLabel[groupsDetails])
				})
				rowDetails.groups = tmpGroups.join('\n')
			})
			this.loading = false
		},
		reloadDatatable() {
			this.loading = true
			this.getGroups()
		}
	}
}
</script>