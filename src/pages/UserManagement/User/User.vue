<template>
	<div 
		id="user" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="user" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<div v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
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
								:isbusy="isbusy"
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
export default {
	name: "User",
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			candelete: false,

			rowdata: [],
			rowheader: [],
			groups: [],
			groupsLabel: [],
			
			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("auth_view_user")) {
			if (permissions.includes("auth_add_user")) {
				this.canadd = true
			}
			if (permissions.includes("auth_change_user")) {
				this.canedit = true
			}
			if (permissions.includes("auth_delete_user")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("users/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["user_permissions", "password"].includes(f)
				)

				// Get groups
				await this.getGroups()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},
		
		async getGroups() {
			this.isbusy = true
			this.groups = []
			this.groupsLabel = {}

			try {
				const data = await this.$api.generic.get("groups/")
				const groups = Array.isArray(data) ? data : (data?.results || [])

				this.groups = groups.map((g) => ({
					id: g.id,
					code: `group_${g.id}`,
					name: g.name,
				}))

				for (const g of groups) {
					this.groupsLabel[g.id] = g.name
				}

				await this.getUsers()
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getUsers() {
			try {
				const data = await this.$api.generic.get("users/")
				this.rowdata = Array.isArray(data) ? data : (data?.results || [])

				this.errormsg = null
				this.errored = false

				this.permissionsGroupsTreatment()
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		permissionsGroupsTreatment() {
			for (const row of this.rowdata || []) {
				const ids = Array.isArray(row?.groups) ? row.groups : []
				row.groups = ids
					.map((id) => this.groupsLabel[id])
					.filter(Boolean)
					.join("\n")
			}
			this.isbusy = false
		},

		async reloadDatatable() {
			await this.getGroups()
		},
	}
}
</script>