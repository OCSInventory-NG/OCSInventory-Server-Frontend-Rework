<template>
	<div 
		id="groups"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="groups"
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
							<GroupModal
								v-if="canadd"
								:permissionsprop="permissions"
								:permissionslabelprop="permissionslabel"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="groups-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:duplicateitem="duplicateitem"
								editcomponent="GroupModal"
								title="groups"
								titlevalue="group"
								translationkey="group."
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
	name: "Group",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			duplicateitem: false,
			rowdata: [],
			rowheader: [],
			permissions: [],
			permissionslabel: [],
			errored: false,
			errormsg: null,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("auth_view_group")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("auth_add_group")) {
				this.canadd = true
				this.duplicateitem = true
			}
			if(localStorage.getItem('permissions').split(",").includes("auth_change_group")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("auth_delete_group")) {
				this.candelete = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"groups/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if (field != "is_protected") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getPermissions()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getPermissions() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"permissions/", { headers: this.header })
				.then(response => {
					var array = ["add_", "change_", "delete_", "view_"]
					var labeltmp = new Set()

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

					this.getGroups()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getGroups() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"groups/", { headers: this.header })
				.then(response => {
					this.rowdata = response.data
					this.permissionsTreatment()
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		permissionsTreatment() {
			this.rowdata.forEach(rowDetails => {
				var tmpPermissions = []
				rowDetails.permissions.forEach(permissionsDetails => {
					this.permissionslabel.forEach(label => {
						this.permissions[label.id].forEach(permissions => {
							if(permissions.id == permissionsDetails) {
								if(typeof tmpPermissions[label.trad] === 'undefined') {
									tmpPermissions[label.trad] = [this.$t('generic.'+permissions.type)]
								} else {
									tmpPermissions[label.trad].push(this.$t('generic.'+permissions.type)) 
								}
							}
						})					
					})
				})

				var tmpTradPermission = []
				Object.keys(tmpPermissions).forEach(key => {
					tmpTradPermission.push(key+" : "+tmpPermissions[key].join(', '))
				});

				tmpTradPermission.sort()

				rowDetails.permissions = tmpTradPermission.join('\n')
			})
		},
		async reloadDatatable() {
			this.loading = true
			await this.getGroups()
		}
	}
}
</script>