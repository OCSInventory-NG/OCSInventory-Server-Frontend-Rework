<template>
	<div
		id="vulnerabilities"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="vulnerabilities" />

			<div class="page-body">
				<div v-if="denied">
					<Alert
						:message="$t('message.dont_have_right_to_see')"
						:cols="true"
						variant="danger"
					/>
				</div>
				<template v-else>
					<VulnerabilityCoverage />

					<div class="card">
						<div class="card-header">
							<h3 class="card-title">
								{{ $t('title.vulnerabilities') }}
							</h3>
						</div>
						<div class="card-body">
							<b-row class="mb-3 g-2">
								<b-col md="2">
									<b-form-select
										v-model="filters.level"
										:options="levelOptions"
									/>
								</b-col>
								<b-col md="2">
									<b-form-select
										v-model="filters.fix"
										:options="fixOptions"
									/>
								</b-col>
								<b-col md="2">
									<b-form-select
										v-model="filters.family"
										:options="familyOptions"
									/>
								</b-col>
								<b-col md="2">
									<b-form-select
										v-model="filters.ordering"
										:options="orderingOptions"
									/>
								</b-col>
								<b-col md="4">
									<b-form-input
										v-model="search"
										type="search"
										:placeholder="$t('security.search')"
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
									{{ $t('security.no_vulnerability') }}
								</p>
								<table
									v-else
									class="table table-sm table-striped table-vcenter"
								>
									<thead>
										<tr>
											<th>{{ $t('security.level') }}</th>
											<th>{{ $t('security.vulnerability') }}</th>
											<th>{{ $t('security.summary') }}</th>
											<th>{{ $t('security.machines') }}</th>
											<th>{{ $t('security.products') }}</th>
											<th>{{ $t('security.fix') }}</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="row in rows"
											:key="row.vuln_id"
											style="cursor: pointer;"
											@click="selected = row.vuln_id"
										>
											<td>
												<VulnerabilityLevel
													:level="row.level"
													:score="row.cvss_score"
												/>
											</td>
											<td class="text-nowrap">
												{{ row.vuln_id }}
												<span
													v-if="row.uncertain"
													class="badge bg-secondary ms-1"
													:title="$t('security.uncertain_help')"
												>
													{{ $t('security.uncertain') }}
												</span>
											</td>
											<td>{{ shorten(row.summary) }}</td>
											<td>{{ row.machines }}</td>
											<td>
												<div
													v-for="product in row.products"
													:key="product.product + product.version"
													class="text-nowrap"
												>
													{{ product.product }} {{ product.version }}
												</div>
												<div
													v-if="row.product_count > row.products.length"
													class="text-muted"
												>
													{{ $t('security.more_products', { count: row.product_count - row.products.length }) }}
												</div>
											</td>
											<td>{{ row.fix_available ? $t('security.fix_available') : $t('security.no_fix') }}</td>
										</tr>
									</tbody>
								</table>
								<b-pagination
									v-if="total > perPage"
									v-model="currentPage"
									:total-rows="total"
									:per-page="perPage"
									align="right"
									size="sm"
								/>
							</template>
						</div>
					</div>

					<VulnerabilityDetailModal
						v-if="selected"
						:vuln-id="selected"
						@closed="selected = null"
					/>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

const SUMMARY_LENGTH = 140

export default {
	name: "Vulnerabilities",
	data() {
		return {
			denied: false,
			errored: false,
			errormsg: null,
			loading: true,

			rows: [],
			total: 0,
			currentPage: 1,
			perPage: 25,
			filters: { level: null, fix: null, family: null, ordering: "-cvss_score" },
			search: "",
			searchTimer: null,
			request: 0,
			selected: null,
		}
	},
	computed: {
		levelOptions() {
			return [
				{ value: null, text: this.$t("security.all_levels") },
				...["critical", "high", "medium", "low", "unknown"].map((level) => ({
					value: level,
					text: this.$t("security.level_" + level),
				})),
			]
		},
		fixOptions() {
			return [
				{ value: null, text: this.$t("security.any_fix") },
				{ value: "yes", text: this.$t("security.fix_available") },
				{ value: "no", text: this.$t("security.no_fix") },
			]
		},
		familyOptions() {
			return [
				{ value: null, text: this.$t("security.all_platforms") },
				...["deb", "rpm", "windows", "macos"].map((family) => ({
					value: family,
					text: this.$t("software_identity.family_" + family),
				})),
			]
		},
		orderingOptions() {
			return [
				{ value: "-cvss_score", text: this.$t("security.by_score") },
				{ value: "-machines", text: this.$t("security.by_machines") },
			]
		},
	},
	watch: {
		filters: {
			deep: true,
			async handler() {
				await this.reload()
			},
		},
		search() {
			clearTimeout(this.searchTimer)
			this.searchTimer = setTimeout(() => this.reload(), 300)
		},
		async currentPage() {
			await this.load()
		},
	},
	async mounted() {
		if (!hasPermission("security_view_vulnerability")) {
			this.denied = true
			return
		}
		await this.load()
	},
	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},
	methods: {
		async reload() {
			if (this.currentPage !== 1) {
				// the currentPage watcher loads the first page
				this.currentPage = 1
				return
			}
			await this.load()
		},
		async load() {
			this.loading = true
			const query = {
				limit: this.perPage,
				offset: (this.currentPage - 1) * this.perPage,
				ordering: this.filters.ordering,
			}
			for (const name of ["level", "fix", "family"]) {
				if (this.filters[name]) {
					query[name] = this.filters[name]
				}
			}
			if (this.search) {
				query.search = this.search
			}
			// An answer to an older filter must not replace a newer one
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerabilities/", query)
				if (request !== this.request) {
					return
				}
				this.rows = data.results || data
				this.total = typeof data.count === "number" ? data.count : this.rows.length
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.detail || e?.message || String(e)
				this.errored = true
			} finally {
				if (request === this.request) {
					this.loading = false
				}
			}
		},
		shorten(text) {
			if (!text || text.length <= SUMMARY_LENGTH) {
				return text
			}
			return text.slice(0, SUMMARY_LENGTH).trimEnd() + "…"
		},
	},
}
</script>
