<template>
	<div
		id="vulnerability-exclusions"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="vulnerability_exclusions" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<Alert
							v-if="denied"
							:message="$t('message.dont_have_right_to_see')"
							:cols="true"
							variant="danger"
						/>
						<template v-else>
							<div class="d-flex align-items-start gap-3 mb-3">
								<p class="text-muted mb-0">
									{{ $t('security.exclusions_help') }}
								</p>
								<b-button
									v-if="canadd"
									variant="primary"
									class="ms-auto text-nowrap"
									@click="openModal(null)"
								>
									<font-awesome-icon
										:icon="['fas', 'plus']"
										class="me-1"
									/>
									{{ $t('security.add_exclusion') }}
								</b-button>
							</div>

							<Alert
								v-if="errored"
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>

							<Datatable
								v-if="ready"
								id="vulnerability-exclusions-datatable"
								:rowdata="rowdata"
								:rowheader="columns"
								:candelete="candelete"
								:candeletemultiple="false"
								:usecheckbox="false"
								:hascustomactions="canedit"
								:isbusy="loading"
								:emptytext="$t('security.exclusions_empty')"
								title="vulnerability_exclusions"
								translationkey="security.column_"
								is-sticky
								@reload-datatable="load"
							>
								<template #toolbar>
									<v-select
										v-model="filters.status"
										:options="statusOptions"
										:reduce="option => option.value"
										:placeholder="$t('security.active_and_expired')"
										:searchable="false"
										label="text"
										class="datatable-btn vuln-filter"
									/>
									<AssetPicker
										v-model="filters.asset"
										:placeholder="$t('security.all_machines')"
										class="datatable-btn vuln-filter"
									/>
									<v-select
										v-model="filters.group"
										:options="groupOptions"
										:reduce="option => option.value"
										:placeholder="$t('security.all_groups')"
										label="text"
										class="datatable-btn vuln-filter"
									/>
									<!-- set by the "see the exclusions" link of a vulnerability -->
									<span
										v-if="filters.vuln_id"
										class="badge bg-blue-lt filter-chip"
									>
										{{ filters.vuln_id }}
										<button
											type="button"
											class="btn-close ms-1"
											:aria-label="$t('generic.delete')"
											@click="filters.vuln_id = ''"
										/>
									</span>
								</template>

								<template #cell(vulnerability)="{ row }">
									<router-link
										v-if="row.item.vuln_id"
										:to="`/security/vulnerabilities/${encodeURIComponent(row.item.vuln_id)}`"
										class="ocs-link text-nowrap"
									>
										{{ row.item.vuln_id }}
									</router-link>
									<span
										v-else
										class="badge bg-orange-lt"
									>{{ $t('security.whole_scan') }}</span>
								</template>
								<template #cell(target)="{ row }">
									<span class="text-nowrap">
										<template v-if="row.item.asset">
											<font-awesome-icon
												:icon="['fas', 'desktop']"
												class="me-1 text-muted"
											/>
											<router-link
												:to="`/inventory/asset/${row.item.asset}`"
												class="ocs-link"
											>
												{{ row.item.target }}
											</router-link>
										</template>
										<template v-else>
											<font-awesome-icon
												:icon="['fas', 'user-group']"
												class="me-1 text-muted"
											/>
											{{ row.item.target }}
										</template>
									</span>
								</template>
								<template #cell(comment)="{ row }">
									<span class="cell-wrap">{{ row.item.comment }}</span>
								</template>
								<template #cell(created)="{ row }">
									<span class="text-nowrap">{{ formatDateTime(row.item.created) }}</span>
								</template>
								<template #cell(expires)="{ row }">
									<span class="text-nowrap">
										{{ row.item.expires ? formatDateTime(row.item.expires) : $t('security.no_expiry') }}
									</span>
								</template>
								<template #cell(status)="{ row }">
									<span
										class="badge"
										:class="row.item.active ? 'bg-green-lt' : 'bg-secondary-lt'"
									>{{ row.item.active ? $t('security.active') : $t('security.expired') }}</span>
								</template>
								<template #cell(firstActions)="{ row }">
									<button
										class="btn btn-ghost-dark"
										:title="$t('security.edit_exclusion')"
										@click="openModal(row.item.source)"
									>
										<font-awesome-icon :icon="['fas', 'pencil']" />
									</button>
								</template>
							</Datatable>
							<div
								v-else
								class="ocs-loader"
							>
								<Loader />
							</div>
						</template>
					</div>
				</div>

				<ExclusionModal
					v-model="modalShown"
					:exclusion="editing"
					@saved="load"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import { apiErrorMessage, asList, formatDateTime } from "@/utils/security"

export default {
	name: "Exclusions",
	data() {
		return {
			denied: false,
			errored: false,
			errormsg: null,
			loading: true,
			// the datatable is drawn once the first rows are in
			ready: false,

			canadd: false,
			canedit: false,
			candelete: false,

			columns: ["vulnerability", "target", "comment", "user_name", "created", "expires", "status"],
			rows: [],
			// asset group names, for the group filter
			groups: {},
			filters: { status: null, asset: null, group: null, vuln_id: this.$route.query.vuln_id || "" },
			request: 0,

			modalShown: false,
			editing: null,
		}
	},
	computed: {
		statusOptions() {
			return [
				{ value: "active", text: this.$t("security.active") },
				{ value: "expired", text: this.$t("security.expired") },
			]
		},
		groupOptions() {
			return Object.entries(this.groups)
				.map(([id, name]) => ({ value: Number(id), text: name }))
				.sort((a, b) => a.text.localeCompare(b.text))
		},
		// plain values for the search and the sort; created_at is drawn by the datatable itself, renamed
		rowdata() {
			return this.rows.map((row) => ({
				id: row.id,
				name: row.vuln_id || this.$t("security.whole_scan"),
				vulnerability: row.vuln_id || this.$t("security.whole_scan"),
				vuln_id: row.vuln_id,
				asset: row.asset,
				target: row.asset ? (row.asset_name || "#" + row.asset) : (row.group_name || this.groups[row.group] || "#" + row.group),
				comment: row.comment,
				user_name: row.user_name,
				created: row.created_at,
				expires: row.expires_at,
				status: row.active ? this.$t("security.active") : this.$t("security.expired"),
				active: row.active,
				source: row,
			}))
		},
	},
	watch: {
		filters: {
			deep: true,
			handler() {
				this.load()
			},
		},
	},
	async mounted() {
		if (!hasPermission("security_view_exclusion")) {
			this.denied = true
			return
		}
		this.canadd = hasPermission("security_add_exclusion")
		this.canedit = hasPermission("security_change_exclusion")
		this.candelete = hasPermission("security_delete_exclusion")
		await Promise.all([this.loadGroups(), this.load()])
	},
	methods: {
		formatDateTime,

		async load() {
			this.loading = true
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerability_exclusions/", {
					asset: this.filters.asset,
					group: this.filters.group,
					vuln_id: this.filters.vuln_id,
					active: this.filters.status ? String(this.filters.status === "active") : null,
				})
				if (request !== this.request) return
				this.rows = asList(data)
				this.errored = false
			} catch (e) {
				if (request !== this.request) return
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			} finally {
				if (request === this.request) {
					this.loading = false
					this.ready = true
				}
			}
		},

		async loadGroups() {
			try {
				const data = await this.$api.generic.get("asset/groups/")
				this.groups = Object.fromEntries(asList(data).map((group) => [group.id, group.name]))
			} catch {
				// group ids are shown instead
			}
		},

		openModal(row) {
			this.editing = row
			this.modalShown = true
		},
	},
}
</script>
