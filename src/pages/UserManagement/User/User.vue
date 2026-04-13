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
								@reload-datatable="reloadDatatable"
							/>

							<Datatable
								id="users-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:isbusy="isbusy"
								is-sticky
								editcomponent="UserModal"
								title="users"
								translationkey="user."
								@reload-datatable="reloadDatatable"
							>
								<template #cell(firstActions)="row">
									<UserGroupAssignmentsModal
										:id="row.row.item.id"
										:username="row.row.item.username"
									/>
								</template>
							</Datatable>
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
		getOrderedSources(sources) {
			const sourceOrder = ["manual", "ldap", "rule"]
			return Array.from(new Set(sources || []))
				.sort((a, b) => sourceOrder.indexOf(a) - sourceOrder.indexOf(b))
		},

		getGroupSourceLabel(source) {
			const sourceLabels = {
				manual: "M",
				ldap: "L",
				rule: "R",
			}

			return sourceLabels[source] || ""
		},

		formatGroupAssignments(groupAssignments) {
			const groupedAssignments = {}

			for (const assignment of groupAssignments || []) {
				const groupId = assignment?.group_id
				const groupName = assignment?.group_name

				if (!groupId || !groupName) {
					continue
				}

				if (!groupedAssignments[groupId]) {
					groupedAssignments[groupId] = {
						groupName,
						sources: [],
					}
				}

				if (assignment?.source && !groupedAssignments[groupId].sources.includes(assignment.source)) {
					groupedAssignments[groupId].sources.push(assignment.source)
				}
			}

			return Object.values(groupedAssignments)
				.map(({ groupName, sources }) => {
					const sourceLabel = this.getOrderedSources(sources)
						.map((source) => this.getGroupSourceLabel(source))
						.filter(Boolean)
						.join(",")

					return sourceLabel ? `${groupName} [${sourceLabel}]` : groupName
				})
				.filter(Boolean)
				.join("\n")
		},

		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("users/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["user_permissions", "password", "group_assignments"].includes(f)
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
				const groupAssignments = Array.isArray(row?.group_assignments) ? row.group_assignments : []
				const formattedAssignments = this.formatGroupAssignments(groupAssignments)

				if (formattedAssignments) {
					row.groups = formattedAssignments
					continue
				}

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
