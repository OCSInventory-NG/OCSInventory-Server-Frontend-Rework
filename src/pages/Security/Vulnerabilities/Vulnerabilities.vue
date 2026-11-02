<template>
	<div
		id="vulnerabilities"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="vulnerabilities" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<div v-if="denied">
							<Alert
								:message="$t('message.dont_have_right_to_see')"
								:cols="true"
								variant="danger"
							/>
						</div>
						<template v-else>
							<!-- What this list cannot show: outdated sources, installations not checked -->
							<Alert
								v-if="errored"
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>

							<Datatable
								id="vulnerabilities-datatable"
								:rowdata="rows"
								:rowheader="columns"
								:nonsortablefields="nonsortable"
								:usecheckbox="false"
								:server-side="true"
								:server-total-rows="total"
								:page-reset-key="pageResetKey"
								:isbusy="loading"
								:emptytext="emptyMessage"
								title="vulnerabilities"
								translationkey="security.column_"
								is-sticky
								@change-query="onQueryChange"
								@reload-datatable="load"
								@export="exportRows"
								@export-all="exportAll"
							>
								<template #toolbar>
									<v-select
										v-for="filter in filterSelects"
										:key="filter.name"
										v-model="filters[filter.name]"
										:options="filter.options"
										:reduce="option => option.value"
										:placeholder="filter.placeholder"
										:searchable="false"
										label="text"
										class="datatable-btn vuln-filter"
									/>
								</template>

								<template #subheader>
									<!-- Active order and hidden noise -->
									<div class="vuln-status">
										<SourceFreshness
											:extra="incompleteLines"
											@loaded="sources = $event"
										/>
										<div class="d-flex flex-wrap align-items-center gap-2">
											<span class="text-muted">{{ $t('security.sorted_by') }}</span>
											<PriorityOrder
												v-if="ordering.length"
												:model-value="ordering"
											/>
											<span
												v-if="sessionOrdering"
												class="badge bg-yellow-lt"
											>{{ $t('security.session_order') }}</span>
											<b-button
												v-if="sessionOrdering"
												size="sm"
												variant="link"
												class="p-0"
												@click="setSessionOrdering(null)"
											>
												{{ $t('security.reset_order') }}
											</b-button>
										</div>
										<div
											v-if="hiddenKinds.length || filters.show.length"
											class="d-flex flex-wrap align-items-center gap-2"
										>
											<font-awesome-icon
												:icon="['fas', 'eye-slash']"
												class="text-muted"
											/>
											<span v-if="hiddenKinds.length">{{ hiddenMessage }}</span>
											<b-button
												v-if="hiddenKinds.length"
												size="sm"
												variant="outline-primary"
												@click="showNoise(hiddenKinds)"
											>
												{{ $t('security.show_hidden') }}
											</b-button>
											<template v-if="filters.show.length">
												<span>{{ $t('security.noise_shown', { kinds: filters.show.map((kind) => $t('security.noise_' + kind)).join(', ') }) }}</span>
												<b-button
													size="sm"
													variant="outline-secondary"
													@click="filters.show = []"
												>
													{{ $t('security.hide_noise') }}
												</b-button>
											</template>
										</div>
									</div>
								</template>

								<template #cell(vuln_id)="{ row }">
									<router-link
										:to="detailLink(row.item.vuln_id)"
										class="ocs-link text-nowrap"
									>
										{{ row.item.vuln_id }}
									</router-link>
									<span
										v-if="row.item.uncertain"
										class="badge bg-secondary ms-1"
										:title="$t('security.uncertain_help')"
									>
										{{ $t('security.uncertain') }}
									</span>
									<span
										v-if="row.item.noise"
										class="badge bg-azure-lt ms-1"
									>{{ $t('security.noise_' + row.item.noise) }}</span>
								</template>
								<template #cell(summary)="{ row }">
									<span
										class="vuln-summary-cell"
										:title="row.item.summary"
									>{{ shorten(row.item.summary) }}</span>
								</template>
								<template #cell(kev)="{ row }">
									<KevBadge
										:kev="row.item.kev"
										:date="row.item.kev_date_added"
									/>
								</template>
								<template #cell(score)="{ row }">
									<VulnerabilityLevel
										:level="row.item.level"
										:score="row.item.cvss_score"
									/>
									<div class="text-muted small score-detail">
										{{ scoreDetail(row.item) }}
									</div>
								</template>
								<template #cell(epss)="{ row }">
									<template v-if="row.item.epss !== null && row.item.epss !== undefined">
										{{ formatPercent(row.item.epss) }}
										<div class="text-muted small text-nowrap">
											{{ $t('security.percentile', { value: formatPercent(row.item.epss_percentile) }) }}
										</div>
									</template>
									<span
										v-else
										class="text-muted"
									>{{ $t('security.unknown') }}</span>
								</template>
								<template #cell(products)="{ row }">
									<div
										v-for="product in row.item.products"
										:key="product.product + product.version"
										class="cell-wrap"
										:title="product.product"
									>
										{{ product.name || product.product }} {{ product.version }}
									</div>
									<div
										v-if="row.item.product_count > row.item.products.length"
										class="text-muted small"
									>
										{{ $t('security.more_products', { count: row.item.product_count - row.item.products.length }) }}
									</div>
								</template>
								<template #cell(fix)="{ row }">
									<VulnerabilityFix
										:versions="row.item.fix_available ? row.item.fixed_versions : []"
										:channels="row.item.fix_channels"
									/>
								</template>
								<template #cell(first_seen)="{ row }">
									<span class="text-nowrap">{{ formatDay(row.item.first_seen) }}</span>
								</template>
							</Datatable>

						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import {
	FAMILIES, LEVELS, NOISE_KINDS, PRIORITY_CRITERIA,
	apiErrorMessage, asList, formatDay, formatPercent, ratingLabel,
} from "@/utils/security"

const SUMMARY_LENGTH = 140
// The order chosen here lasts for the session, the settings give the default
const ORDERING_KEY = "vulnerabilities_ordering"
// A click on these headers sorts on the criterion first; the others do not sort
const COLUMNS = ["vuln_id", "summary", "kev", "score", "epss", "machines", "products", "fix", "first_seen"]

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

			columns: COLUMNS,
			nonsortable: COLUMNS.filter((column) => !PRIORITY_CRITERIA.includes(column)),
			rows: [],
			total: 0,
			pageResetKey: 0,
			// page and search given by the datatable
			query: {
				limit: Number(localStorage.getItem("perPage")) || 5,
				offset: 0,
				search: null,
			},
			headerSort: null,
			filters: { level: null, fix: null, kev: null, family: null, show: [] },
			request: 0,

			// order answered by the server, the settings one when none is asked
			ordering: [],
			sessionOrdering: readSessionOrdering(),
			hidden: {},
			sources: [],
			// null while the coverage is not read
			unchecked: null,
		}
	},
	computed: {
		filterSelects() {
			return [
				{
					name: "level",
					placeholder: this.$t("security.all_levels"),
					options: LEVELS.map((level) => ({ value: level, text: this.$t("security.level_" + level) })),
				},
				{
					name: "fix",
					placeholder: this.$t("security.any_fix"),
					options: [
						{ value: "yes", text: this.$t("security.fix_available") },
						{ value: "no", text: this.$t("security.fix_none") },
					],
				},
				{
					name: "kev",
					placeholder: this.$t("security.any_kev"),
					options: [
						{ value: "yes", text: this.$t("security.kev_yes") },
						{ value: "no", text: this.$t("security.kev_no") },
					],
				},
				{
					name: "family",
					placeholder: this.$t("security.all_platforms"),
					options: FAMILIES.map((family) => ({ value: family, text: this.$t("software_identity.family_" + family) })),
				},
			]
		},
		outdatedSources() {
			return this.sources.filter((source) => source.state !== "fresh")
		},
		// Reasons, besides the sources, why a vulnerability may be missing
		incompleteLines() {
			const lines = []
			if (!this.unchecked) {
				return lines
			}
			if (!this.unchecked.total) {
				lines.push(this.$t("security.notice_nothing_checked"))
			} else if (this.unchecked.installations) {
				lines.push(this.$t("security.notice_unchecked", { count: this.unchecked.installations }, this.unchecked.installations))
			}
			if (this.unchecked.kernels) {
				lines.push(this.$t("security.notice_kernels", { count: this.unchecked.kernels }, this.unchecked.kernels))
			}
			return lines
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
		// An empty list only says something about what could be checked
		emptyMessage() {
			const filtered = this.query.search || Object.entries(this.filters).some(([name, value]) => name !== "show" && value)
			if (filtered) {
				return this.$t("security.no_vulnerability_filtered")
			}
			if (!this.unchecked) {
				return this.$t("security.no_vulnerability_unknown_coverage")
			}
			if (!this.unchecked.total) {
				return this.$t("security.no_vulnerability_nothing_checked")
			}
			if (this.outdatedSources.length) {
				return this.$t("security.no_vulnerability_outdated")
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
	},
	async mounted() {
		if (!hasPermission("security_view_vulnerability")) {
			this.denied = true
			return
		}
		await Promise.all([this.load(), this.loadCoverage()])
	},
	methods: {
		formatDay,
		formatPercent,

		async reload() {
			this.query = { ...this.query, offset: 0 }
			this.pageResetKey += 1
			await this.load()
		},

		// Page, page size and search come from the datatable, a header click puts its criterion first
		async onQueryChange(query) {
			const criterion = query.ordering ? query.ordering.replace(/^-/, "") : null
			const sorted = criterion && criterion !== this.headerSort && PRIORITY_CRITERIA.includes(criterion)
			this.headerSort = criterion
			this.query = { limit: query.limit, offset: query.offset, search: query.search }
			if (sorted) {
				this.putFirst(criterion)
				return
			}
			await this.load()
		},

		params(paginated = true) {
			const params = {
				ordering: this.sessionOrdering ? this.sessionOrdering.join(",") : null,
				show: this.filters.show.join(","),
				search: this.query.search,
				level: this.filters.level,
				fix: this.filters.fix,
				kev: this.filters.kev,
				family: this.filters.family,
			}
			if (paginated) {
				params.limit = this.query.limit
				params.offset = this.query.offset
			}
			return params
		},

		async load() {
			this.loading = true
			// An answer to an older filter must not replace a newer one
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerabilities/", this.params())
				if (request !== this.request) {
					return
				}
				// the datatable keys its rows on id
				this.rows = asList(data).map((row) => ({ ...row, id: row.vuln_id }))
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
				// every installation, for the "N out of M" line
				const total = (coverage.families || []).reduce((sum, family) =>
					sum + Object.values(family.installations || {}).reduce((count, value) => count + value, 0), 0)
				const kernels = Object.entries(coverage.kernels || {})
					.filter(([state]) => state !== "checked")
					.reduce((sum, [, count]) => sum + count, 0)
				this.unchecked = { installations: coverage.unchecked || 0, excluded: coverage.excluded || 0, total, kernels }
			} catch {
				// unknown coverage: the empty list says so
				this.unchecked = null
			}
		},

		setSessionOrdering(order) {
			this.sessionOrdering = order
			if (!order) {
				// the next click on the sorted header counts again
				this.headerSort = null
			}
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

		showNoise(kinds) {
			this.filters.show = [...new Set([...this.filters.show, ...kinds])]
		},

		// Export: one line per vulnerability, lists joined
		csvRows(rows) {
			return rows.map((row) => ({
				vuln_id: row.vuln_id,
				summary: row.summary,
				level: row.level,
				cvss_score: row.cvss_score ?? "",
				cvss_version: row.cvss_version || "",
				distro_rating: row.distro_rating || "",
				kev: row.kev ? "yes" : "no",
				kev_date_added: row.kev_date_added || "",
				epss: row.epss ?? "",
				epss_percentile: row.epss_percentile ?? "",
				machines: row.machines,
				products: (row.products || []).map((product) => `${product.product} ${product.version}`).join(", "),
				product_count: row.product_count,
				fixed_versions: (row.fixed_versions || []).join(", "),
				fix_channels: (row.fix_channels || []).join(", "),
				uncertain: row.uncertain ? "yes" : "no",
				first_seen: row.first_seen || "",
			}))
		},

		exportRows({ scope, rows }) {
			const lines = this.csvRows(rows)
			if (!lines.length) return
			const headers = Object.keys(lines[0])
			const csv = [
				headers.join(";"),
				...lines.map((line) => headers.map((header) => `"${String(line[header] ?? "").replace(/"/g, '""')}"`).join(";")),
			].join("\n")
			const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
			const link = document.createElement("a")
			link.href = url
			link.setAttribute("download", `vulnerabilities_${scope}.csv`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
		},

		async exportAll() {
			try {
				// without limit the list comes whole
				const data = await this.$api.generic.get("vulnerabilities/", this.params(false))
				this.exportRows({ scope: "all", rows: asList(data) })
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			}
		},

		scoreDetail(row) {
			return [
				row.cvss_version ? `CVSS ${row.cvss_version}` : "",
				row.distro_rating ? this.$t("security.distro_short", { rating: ratingLabel(this, row.distro_rating) }) : "",
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
