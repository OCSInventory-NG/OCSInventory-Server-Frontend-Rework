<template>
	<div id="user-group-assignments-modal">
		<button
			:title="$t('user.view_group_assignments')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon
				:icon="['fa', 'user-group']"
			/>
		</button>

		<b-modal
			:id="idModal"
			v-model="groupAssignmentsModal"
			:title="$t('user.group_assignments_title')"
			hide-footer
			modal-class="custom-modal"
			size="xl"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('user.group_assignments_title') }}
					<span v-if="username">
						- {{ username }}
					</span>
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

			<Alert
				v-if="errored"
				:message="errormsg"
				variant="danger"
			/>

			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else>
				<b-table
					:items="assignments"
					:fields="fields"
					striped
					hover
					bordered
					class="table-vcenter"
					show-empty
				>
					<template #empty="">
						{{ $t('generic.no_data') }}
					</template>
				</b-table>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "UserGroupAssignmentsModal",
	props: {
		id: { type: [String, Number], default: null },
		username: { type: String, default: "" }
	},
	data() {
		return {
			groupAssignmentsModal: false,
			loading: false,
			errored: false,
			errormsg: null,
			assignments: [],
			idModal: `user-group-assignments-${this.id}`,
			fields: [
				{ key: "group_name", label: this.$t("user.group_assignment_group") },
				{ key: "source", label: this.$t("user.group_assignment_method") },
				{ key: "source_name", label: this.$t("user.group_assignment_source") },
			]
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		getSourceLabel(source) {
			const sourceLabels = {
				manual: this.$t("user.group_assignment_manual"),
				ldap: "LDAP",
				rule: this.$t("user.group_assignment_rule"),
			}

			return sourceLabels[source] || source || "N/A"
		},

		async loadData(id) {
			this.groupAssignmentsModal = true
			this.loading = true
			this.errored = false
			this.errormsg = null
			this.assignments = []

			try {
				const data = await this.$api.generic.get(`users/${id}/`)
				const groupAssignments = Array.isArray(data?.group_assignments) ? data.group_assignments : []
				this.assignments = await this.resolveAssignments(groupAssignments)
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async resolveAssignments(groupAssignments) {
			const ruleIds = Array.from(
				new Set(
					(groupAssignments || [])
						.filter((assignment) => assignment?.source === "rule" && assignment?.source_object_id)
						.map((assignment) => assignment.source_object_id)
				)
			)
			const ldapIds = Array.from(
				new Set(
					(groupAssignments || [])
						.filter((assignment) => assignment?.source === "ldap" && assignment?.source_object_id)
						.map((assignment) => assignment.source_object_id)
				)
			)

			const [ruleEntries, ldapEntries] = await Promise.all([
				Promise.all(ruleIds.map(async (ruleId) => {
					try {
						const rule = await this.$api.generic.get(`automation/rule/${ruleId}/`)
						return [ruleId, rule?.description || `#${ruleId}`]
					} catch (e) {
						return [ruleId, `#${ruleId}`]
					}
				})),
				Promise.all(ldapIds.map(async (ldapId) => {
					try {
						const authConfig = await this.$api.generic.get(`auth_config/${ldapId}/`)
						return [ldapId, authConfig?.name || `#${ldapId}`]
					} catch (e) {
						return [ldapId, `#${ldapId}`]
					}
				}))
			])

			const ruleMap = Object.fromEntries(ruleEntries)
			const ldapMap = Object.fromEntries(ldapEntries)

			return (groupAssignments || []).map((assignment) => ({
				group_name: assignment?.group_name || "N/A",
				source: this.getSourceLabel(assignment?.source),
				source_name: this.getSourceName(assignment, ruleMap, ldapMap),
			}))
		},

		getSourceName(assignment, ruleMap, ldapMap) {
			if (assignment?.source === "rule") {
				return ruleMap?.[assignment.source_object_id] || "N/A"
			}

			if (assignment?.source === "ldap") {
				return ldapMap?.[assignment.source_object_id] || "N/A"
			}

			return "N/A"
		}
	}
}
</script>
