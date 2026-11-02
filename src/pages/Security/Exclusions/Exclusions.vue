<template>
	<div
		id="vulnerability-exclusions"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="vulnerability_exclusions" />

			<div class="page-body">
				<div v-if="denied">
					<Alert
						:message="$t('message.dont_have_right_to_see')"
						:cols="true"
						variant="danger"
					/>
				</div>
				<div
					v-else
					class="card"
				>
					<div class="card-header">
						<h3 class="card-title">
							{{ $t('title.vulnerability_exclusions') }}
						</h3>
						<div class="card-actions">
							<b-button
								v-if="canadd"
								variant="primary"
								@click="openModal(null)"
							>
								<font-awesome-icon
									:icon="['fas', 'plus']"
									class="me-1"
								/>
								{{ $t('security.add_exclusion') }}
							</b-button>
						</div>
					</div>
					<div class="card-body">
						<p class="text-muted">
							{{ $t('security.exclusions_help') }}
						</p>
						<b-row class="mb-3 g-2">
							<b-col md="3">
								<b-form-input
									v-model="search"
									type="search"
									:placeholder="$t('security.exclusions_search')"
								/>
							</b-col>
							<b-col md="2">
								<b-form-select
									v-model="filters.status"
									:options="statusOptions"
								/>
							</b-col>
							<b-col md="3">
								<AssetPicker
									v-model="filters.asset"
									:placeholder="$t('security.all_machines')"
								/>
							</b-col>
							<b-col md="2">
								<b-form-select
									v-model="filters.group"
									:options="groupOptions"
								/>
							</b-col>
							<b-col md="2">
								<b-form-input
									v-model.trim="filters.vuln_id"
									:placeholder="$t('security.vulnerability')"
								/>
							</b-col>
						</b-row>

						<Alert
							v-if="errored"
							:message="errormsg"
							:cols="true"
							variant="danger"
						/>
						<div
							v-else-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<template v-else>
							<p v-if="!rows.length">
								{{ $t('security.exclusions_empty') }}
							</p>
							<div
								v-else
								class="table-responsive"
							>
								<table class="table table-sm table-striped table-vcenter">
									<thead>
										<tr>
											<th>{{ $t('security.vulnerability') }}</th>
											<th>{{ $t('security.exclusion_target') }}</th>
											<th>{{ $t('security.exclusion_comment') }}</th>
											<th>{{ $t('security.user') }}</th>
											<th>{{ $t('security.created_at') }}</th>
											<th>{{ $t('security.exclusion_expires') }}</th>
											<th>{{ $t('security.state') }}</th>
											<th v-if="canedit || candelete" />
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="row in pagedRows"
											:key="row.id"
											:class="{ 'text-muted': !row.active }"
										>
											<td class="text-nowrap">
												<router-link
													v-if="row.vuln_id"
													:to="`/security/vulnerabilities/${encodeURIComponent(row.vuln_id)}`"
												>
													{{ row.vuln_id }}
												</router-link>
												<span
													v-else
													class="badge bg-orange-lt"
												>{{ $t('security.whole_scan') }}</span>
											</td>
											<td>
												<template v-if="row.asset">
													<font-awesome-icon
														:icon="['fas', 'desktop']"
														class="me-1"
													/>
													<router-link :to="`/inventory/asset/${row.asset}`">
														{{ row.asset_name || '#' + row.asset }}
													</router-link>
												</template>
												<template v-else-if="row.group">
													<font-awesome-icon
														:icon="['fas', 'user-group']"
														class="me-1"
													/>
													{{ groupName(row) }}
												</template>
											</td>
											<td class="exclusion-comment">
												{{ row.comment }}
											</td>
											<td>{{ row.user_name }}</td>
											<td class="text-nowrap">
												{{ formatDateTime(row.created_at) }}
											</td>
											<td class="text-nowrap">
												{{ row.expires_at ? formatDateTime(row.expires_at) : $t('security.no_expiry') }}
											</td>
											<td>
												<span
													class="badge"
													:class="row.active ? 'bg-green-lt' : 'bg-secondary-lt'"
												>{{ row.active ? $t('security.active') : $t('security.expired') }}</span>
											</td>
											<td
												v-if="canedit || candelete"
												class="text-nowrap"
											>
												<div class="d-flex">
													<button
														v-if="canedit"
														class="btn btn-ghost-dark"
														:title="$t('security.edit_exclusion')"
														@click="openModal(row)"
													>
														<font-awesome-icon :icon="['fas', 'pencil']" />
													</button>
													<DeleteItemModal
														v-if="candelete"
														:id="row.id"
														:name="row.vuln_id || $t('security.whole_scan')"
														parameter="vulnerability_exclusions"
														@reload-datatable="load"
													/>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<b-pagination
								v-if="rows.length > perPage"
								v-model="currentPage"
								:total-rows="rows.length"
								:per-page="perPage"
								align="right"
								size="sm"
							/>
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

			canadd: false,
			canedit: false,
			candelete: false,

			rows: [],
			// asset group names, for the group filter
			groups: {},
			filters: { status: null, asset: null, group: null, vuln_id: this.$route.query.vuln_id || "" },
			search: "",
			searchTimer: null,
			request: 0,
			currentPage: 1,
			perPage: 25,

			modalShown: false,
			editing: null,
		}
	},
	computed: {
		statusOptions() {
			return [
				{ value: null, text: this.$t("security.active_and_expired") },
				{ value: "active", text: this.$t("security.active") },
				{ value: "expired", text: this.$t("security.expired") },
			]
		},
		groupOptions() {
			return [
				{ value: null, text: this.$t("security.all_groups") },
				...Object.entries(this.groups)
					.map(([id, name]) => ({ value: Number(id), text: name }))
					.sort((a, b) => a.text.localeCompare(b.text)),
			]
		},
		pagedRows() {
			const start = (this.currentPage - 1) * this.perPage
			return this.rows.slice(start, start + this.perPage)
		},
	},
	watch: {
		"filters.status"() {
			this.load()
		},
		"filters.asset"() {
			this.load()
		},
		"filters.group"() {
			this.load()
		},
		"filters.vuln_id"() {
			this.debouncedLoad()
		},
		search() {
			this.debouncedLoad()
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
	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},
	methods: {
		formatDateTime,

		debouncedLoad() {
			clearTimeout(this.searchTimer)
			this.searchTimer = setTimeout(() => this.load(), 300)
		},

		async load() {
			this.loading = true
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerability_exclusions/", {
					search: this.search,
					asset: this.filters.asset,
					group: this.filters.group,
					vuln_id: this.filters.vuln_id,
					active: this.filters.status === null ? null : String(this.filters.status === "active"),
				})
				if (request !== this.request) return
				this.rows = asList(data)
				this.currentPage = 1
				this.errored = false
			} catch (e) {
				if (request !== this.request) return
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			} finally {
				if (request === this.request) this.loading = false
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

		groupName(row) {
			return row.group_name || this.groups[row.group] || "#" + row.group
		},

		openModal(row) {
			this.editing = row
			this.modalShown = true
		},
	},
}
</script>
