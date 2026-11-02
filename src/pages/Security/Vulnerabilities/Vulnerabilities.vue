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
					<SourceFreshness />

					<!-- What the list cannot tell: installations that were not checked -->
					<div
						v-if="unchecked.installations || unchecked.kernels"
						class="alert alert-warning mb-3"
					>
						<font-awesome-icon
							:icon="['fas', 'triangle-exclamation']"
							class="me-2"
						/>
						<span v-if="unchecked.installations">
							{{ $t('security.list_unchecked', { count: unchecked.installations, total: unchecked.total }) }}
						</span>
						<span
							v-if="unchecked.kernels"
							class="ms-1"
						>
							{{ $t('security.list_kernels_unchecked', { count: unchecked.kernels }) }}
						</span>
						<router-link
							to="/security/coverage"
							class="ms-2"
						>
							{{ $t('security.see_coverage') }}
						</router-link>
					</div>

					<div class="card">
						<div class="card-header">
							<h3 class="card-title">
								{{ $t('title.vulnerabilities') }}
							</h3>
							<div class="card-actions">
								<span class="text-muted">{{ $t('generic.result') }} : {{ total }}</span>
							</div>
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
										v-model="filters.kev"
										:options="kevOptions"
									/>
								</b-col>
								<b-col md="2">
									<b-form-select
										v-model="filters.family"
										:options="familyOptions"
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

							<!-- Active order: every criterion is a column below -->
							<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
								<strong>{{ $t('security.sorted_by') }}</strong>
								<PriorityOrder
									v-if="ordering.length"
									:model-value="ordering"
									inline
								/>
								<span
									v-if="sessionOrdering"
									class="badge bg-yellow-lt"
								>{{ $t('security.session_order') }}</span>
								<b-button
									v-if="sessionOrdering"
									size="sm"
									variant="link"
									@click="setSessionOrdering(null)"
								>
									{{ $t('security.reset_order') }}
								</b-button>
								<span class="text-muted small">{{ $t('security.order_hint') }}</span>
							</div>

							<!-- Noise hidden by default, always counted -->
							<div
								v-if="hiddenKinds.length || filters.show.length"
								class="alert alert-info mb-3"
							>
								<div v-if="hiddenKinds.length">
									<font-awesome-icon
										:icon="['fas', 'eye-slash']"
										class="me-2"
									/>
									{{ hiddenMessage }}
									<b-button
										size="sm"
										variant="outline-primary"
										class="ms-2"
										@click="showNoise(hiddenKinds)"
									>
										{{ $t('security.show_hidden') }}
									</b-button>
								</div>
								<div v-if="filters.show.length">
									{{ $t('security.noise_shown', { kinds: filters.show.map((kind) => $t('security.noise_' + kind)).join(', ') }) }}
									<b-button
										size="sm"
										variant="link"
										@click="filters.show = []"
									>
										{{ $t('security.hide_noise') }}
									</b-button>
								</div>
							</div>

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
									{{ emptyMessage }}
								</p>
								<div
									v-else
									class="table-responsive"
								>
									<table class="table table-sm table-striped table-vcenter">
										<thead>
											<tr>
												<th>{{ $t('security.vulnerability') }}</th>
												<th>{{ $t('security.summary') }}</th>
												<th
													v-for="criterion in criterionColumns"
													:key="criterion"
													class="text-nowrap"
												>
													<a
														href="#"
														class="text-reset"
														:title="$t('security.sort_first')"
														@click.prevent="putFirst(criterion)"
													>
														{{ $t('security.column_' + criterion) }}
													</a>
													<span
														v-if="rank(criterion)"
														class="badge bg-blue-lt ms-1"
													>{{ rank(criterion) }}</span>
												</th>
												<th>{{ $t('security.products') }}</th>
												<th>{{ $t('security.fix') }}</th>
												<th>{{ $t('security.first_seen') }}</th>
											</tr>
										</thead>
										<tbody>
											<tr
												v-for="row in rows"
												:key="row.vuln_id"
											>
												<td class="text-nowrap">
													<router-link :to="detailLink(row.vuln_id)">
														{{ row.vuln_id }}
													</router-link>
													<span
														v-if="row.uncertain"
														class="badge bg-secondary ms-1"
														:title="$t('security.uncertain_help')"
													>
														{{ $t('security.uncertain') }}
													</span>
												</td>
												<td class="vuln-summary">
													{{ shorten(row.summary) }}
												</td>
												<td
													v-for="criterion in criterionColumns"
													:key="criterion"
												>
													<KevBadge
														v-if="criterion === 'kev'"
														:kev="row.kev"
														:date="row.kev_date_added"
													/>
													<template v-else-if="criterion === 'score'">
														<VulnerabilityLevel
															:level="row.level"
															:score="row.cvss_score"
														/>
														<div class="text-muted small text-nowrap">
															{{ scoreDetail(row) }}
														</div>
													</template>
													<template v-else-if="criterion === 'epss'">
														<template v-if="row.epss !== null && row.epss !== undefined">
															{{ formatPercent(row.epss) }}
															<div class="text-muted small text-nowrap">
																{{ $t('security.percentile', { value: formatPercent(row.epss_percentile) }) }}
															</div>
														</template>
														<span
															v-else
															class="text-muted"
														>—</span>
													</template>
													<template v-else>
														{{ row.machines }}
													</template>
												</td>
												<td>
													<div
														v-for="product in row.products"
														:key="product.product + product.version"
														class="text-nowrap"
														:title="product.product"
													>
														{{ product.name || product.product }} {{ product.version }}
													</div>
													<div
														v-if="row.product_count > row.products.length"
														class="text-muted"
													>
														{{ $t('security.more_products', { count: row.product_count - row.products.length }) }}
													</div>
												</td>
												<td>
													<VulnerabilityFix
														:versions="row.fix_available ? row.fixed_versions : []"
														:channels="row.fix_channels"
													/>
												</td>
												<td class="text-nowrap">
													{{ formatDay(row.first_seen) }}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
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
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import {
	FAMILIES, LEVELS, NOISE_KINDS, PRIORITY_CRITERIA,
	apiErrorMessage, asList, formatDay, formatPercent,
} from "@/utils/security"

const SUMMARY_LENGTH = 140
// The order chosen here lasts for the session, the settings give the default
const ORDERING_KEY = "vulnerabilities_ordering"

function readSessionOrdering() {
	try {
		const value = JSON.parse(sessionStorage.getItem(ORDERING_KEY))
		return Array.isArray(value) && value.length ? value : null
	} catch {
		return null
	}
}

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
			filters: { level: null, fix: null, kev: null, family: null, show: [] },
			search: "",
			searchTimer: null,
			request: 0,

			// order answered by the server, the settings one when none is asked
			ordering: [],
			sessionOrdering: readSessionOrdering(),
			hidden: {},
			unchecked: { installations: 0, total: 0, kernels: 0 },
		}
	},
	computed: {
		levelOptions() {
			return [
				{ value: null, text: this.$t("security.all_levels") },
				...LEVELS.map((level) => ({ value: level, text: this.$t("security.level_" + level) })),
			]
		},
		fixOptions() {
			return [
				{ value: null, text: this.$t("security.any_fix") },
				{ value: "yes", text: this.$t("security.fix_available") },
				{ value: "no", text: this.$t("security.fix_none") },
			]
		},
		kevOptions() {
			return [
				{ value: null, text: this.$t("security.any_kev") },
				{ value: "yes", text: this.$t("security.kev_yes") },
				{ value: "no", text: this.$t("security.kev_no") },
			]
		},
		familyOptions() {
			return [
				{ value: null, text: this.$t("security.all_platforms") },
				...FAMILIES.map((family) => ({ value: family, text: this.$t("software_identity.family_" + family) })),
			]
		},
		// Criteria columns in the active order, the others after them
		criterionColumns() {
			return [...this.ordering, ...PRIORITY_CRITERIA.filter((criterion) => !this.ordering.includes(criterion))]
		},
		hiddenKinds() {
			return NOISE_KINDS.filter((kind) => this.hidden[kind] > 0)
		},
		hiddenMessage() {
			const parts = this.hiddenKinds.map((kind) =>
				this.$t("security.hidden_" + kind, { count: this.hidden[kind] }, this.hidden[kind])
			)
			const items = parts.length > 1
				? parts.slice(0, -1).join(", ") + " " + this.$t("security.and") + " " + parts[parts.length - 1]
				: parts[0]
			const count = this.hiddenKinds.reduce((sum, kind) => sum + this.hidden[kind], 0)
			return this.$t("security.hidden_banner", { items }, count)
		},
		emptyMessage() {
			const filtered = this.search || Object.entries(this.filters).some(([name, value]) => name !== "show" && value)
			if (filtered) {
				return this.$t("security.no_vulnerability_filtered")
			}
			return this.unchecked.installations
				? this.$t("security.no_vulnerability_checked_only", { count: this.unchecked.installations })
				: this.$t("security.no_vulnerability_checked")
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
		await Promise.all([this.load(), this.loadCoverage()])
	},
	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},
	methods: {
		formatDay,
		formatPercent,

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
				ordering: this.sessionOrdering ? this.sessionOrdering.join(",") : null,
				show: this.filters.show.join(","),
				search: this.search,
			}
			for (const name of ["level", "fix", "kev", "family"]) {
				query[name] = this.filters[name]
			}
			// An answer to an older filter must not replace a newer one
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerabilities/", query)
				if (request !== this.request) {
					return
				}
				this.rows = asList(data)
				this.total = typeof data.count === "number" ? data.count : this.rows.length
				this.ordering = data.ordering || this.sessionOrdering || []
				this.hidden = data.hidden || {}
				this.errored = false
			} catch (e) {
				if (request !== this.request) {
					return
				}
				// An order saved before a settings change can be refused, the default one is used then
				if (e?.response?.status === 400 && e.response.data?.ordering && this.sessionOrdering) {
					this.setSessionOrdering(null)
					return
				}
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			} finally {
				if (request === this.request) {
					this.loading = false
				}
			}
		},

		async loadCoverage() {
			try {
				const coverage = await this.$api.generic.get("vulnerabilities/coverage/")
				let installations = 0
				let total = 0
				for (const family of coverage.families || []) {
					for (const [state, count] of Object.entries(family.installations || {})) {
						total += count
						// a kernel package that does not run is not a missing check
						if (state !== "checked" && state !== "kernel_not_running") {
							installations += count
						}
					}
				}
				const kernels = Object.entries(coverage.kernels || {})
					.filter(([state]) => state !== "checked")
					.reduce((sum, [, count]) => sum + count, 0)
				this.unchecked = { installations, total, kernels }
			} catch {
				// The coverage page shows the error, the list stays usable
			}
		},

		setSessionOrdering(order) {
			this.sessionOrdering = order
			try {
				if (order) {
					sessionStorage.setItem(ORDERING_KEY, JSON.stringify(order))
				} else {
					sessionStorage.removeItem(ORDERING_KEY)
				}
			} catch {
				// storage refused: the order lasts for this page only
			}
			this.reload()
		},

		putFirst(criterion) {
			const order = this.ordering.length ? this.ordering : PRIORITY_CRITERIA
			this.setSessionOrdering([criterion, ...order.filter((item) => item !== criterion)])
		},

		rank(criterion) {
			const index = this.ordering.indexOf(criterion)
			return index === -1 ? null : index + 1
		},

		showNoise(kinds) {
			this.filters.show = [...new Set([...this.filters.show, ...kinds])]
		},

		scoreDetail(row) {
			return [
				row.cvss_version ? `CVSS ${row.cvss_version}` : "",
				row.distro_rating ? this.$t("security.distro_short", { rating: row.distro_rating }) : "",
			].filter(Boolean).join(" · ")
		},

		detailLink(vulnId) {
			return `/security/vulnerabilities/${encodeURIComponent(vulnId)}`
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
