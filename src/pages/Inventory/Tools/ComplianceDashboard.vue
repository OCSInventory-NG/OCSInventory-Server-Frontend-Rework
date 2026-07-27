<template>
	<div
		id="compliance-dashboard"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="compliance" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<b-tabs
							v-model="mainTab"
							vertical
							pills
							card
							content-class="col-10 sticky-tabs"
						>
							<!-- By assets -->
							<b-tab
								:title="$t('title.compliance_by_assets')"
								title-item-class="ocs-menu-tab"
							>
								<section v-if="results.errored">
									<Alert
										:message="results.errormsg"
										:cols="true"
										variant="danger"
									/>
								</section>

								<!-- Cartes récapitulatives -->
								<div
									v-if="!resultsSummary.loading"
									class="d-flex gap-2 mb-3 mt-3"
								>
									<div
										v-for="s in severityTiles"
										:key="s.key"
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle(s.color, activeFilter && activeFilter.type === 'severity' && activeFilter.value === s.key)"
										@click="setTileFilter('severity', s.key)"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div
												class="subheader mb-1"
												:style="{ color: s.color }"
											>
												{{ s.label }}
											</div>
											<div class="h3 mb-0">
												{{ resultsSummary.severities[s.key] }}
											</div>
										</div>
									</div>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#2fb344', activeFilter?.type === 'status' && activeFilter?.value === 'compliant')"
										@click="setTileFilter('status', 'compliant')"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div class="subheader mb-1 text-success">
												{{ $t('compliance.compliant') }}
											</div>
											<div class="h3 mb-0 text-success">
												{{ resultsSummary.compliant }}
											</div>
											<div class="text-muted small">
												{{ $t('compliance.summary_compliance_rate') }} : {{ complianceRate }}%
											</div>
										</div>
									</div>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#d63939', activeFilter?.type === 'status' && activeFilter?.value === 'non_compliant')"
										@click="setTileFilter('status', 'non_compliant')"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div class="subheader mb-1 text-danger">
												{{ $t('compliance.non_compliant') }}
											</div>
											<div class="h3 mb-0 text-danger">{{ resultsSummary.nonCompliant }}</div>
										</div>
									</div>
								</div>

								<div
									v-if="results.loading"
									class="ocs-loader"
								>
									<Loader />
								</div>

								<div v-else>
									<Datatable
										v-if="activeFilter?.type === 'status' && activeFilter?.value === 'compliant'"
										id="compliance-compliant-datatable"
										:rowdata="compliantAssetsRowdata"
										:rowheader="['asset']"
										:usecheckbox="false"
										:canaccessdetails="true"
										title="compliance_results"
										translationkey="compliance."
										:server-side="false"
										is-sticky
									/>
									<Datatable
										v-else-if="activeFilter?.type === 'status' && activeFilter?.value === 'non_compliant'"
										id="compliance-noncompliant-datatable"
										:rowdata="nonCompliantAssetsRowdata"
										:rowheader="['asset', 'rule']"
										:clickablecells="['rule']"
										:usecheckbox="false"
										:canaccessdetails="true"
										title="compliance_results"
										translationkey="compliance."
										:server-side="false"
										is-sticky
										@cell-click="onNonCompliantCellClick"
									/>
									<Datatable
										v-else-if="activeFilter?.type === 'severity'"
										id="compliance-severity-datatable"
										:rowdata="severityAssetsRowdata"
										:rowheader="['asset', 'rule']"
										:clickablecells="['rule']"
										:usecheckbox="false"
										:canaccessdetails="true"
										title="compliance_results"
										translationkey="compliance."
										:server-side="false"
										is-sticky
										@cell-click="onNonCompliantCellClick"
									/>
									<Datatable
										v-else
										id="compliance-results-datatable"
										:rowdata="results.rowdata"
										:rowheader="results.rowheader"
										:usecheckbox="false"
										:canaccessdetails="true"
										title="compliance_results"
										translationkey="compliance."
										:server-side="true"
										:server-total-rows="results.total"
										:isbusy="results.isbusy"
										is-sticky
										@change-query="handleResultsQueryChange"
										@export="handleResultsExport"
										@export-all="exportAllResults"
										@reload-datatable="reloadResults"
									/>
								</div>
							</b-tab>

							<b-tab
								:title="$t('title.compliance_by_rules')"
								title-item-class="ocs-menu-tab"
							>
								<section v-if="byrules.errored">
									<Alert
										:message="byrules.errormsg"
										:cols="true"
										variant="danger"
									/>
								</section>

								<div
									v-if="byrules.loading"
									class="ocs-loader"
								>
									<Loader />
								</div>

								<div v-else-if="byrules.selectedRule">
									<a
										href="#"
										class="ocs-link d-inline-block mb-2"
										@click.prevent="byrules.selectedRule = null"
									>
										← {{ $t('compliance.back_to_rules') }}
									</a>
									<h2 class="mb-3">{{ byrules.selectedRule.rule_name }}</h2>
									<Datatable
										id="compliance-byrules-assets-datatable"
										:rowdata="byrules.assetsRowdata"
										:rowheader="['asset']"
										:usecheckbox="false"
										:canaccessdetails="true"
										:isbusy="byrules.assetsLoading"
										title="compliance_results"
										translationkey="compliance."
										:server-side="false"
										is-sticky
									/>
								</div>

								<div v-else>
									<div class="d-flex gap-2 mb-3 mt-3">
										<div
											v-for="s in severityTiles"
											:key="s.key"
											class="card flex-fill"
											style="cursor: pointer;"
											:style="tileStyle(s.color, byrules.filter === s.key)"
											@click="setByRulesFilter(s.key)"
										>
											<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
												<div
													class="subheader mb-1"
													:style="{ color: s.color }"
												>
													{{ s.label }}
												</div>
												<div class="h3 mb-0">{{ byRulesTileCounts[s.key] }}</div>
											</div>
										</div>
									</div>
									<Datatable
										id="compliance-byrules-datatable"
										:rowdata="byrulesRowdata"
										:rowheader="['rule_name', 'severity', 'type', 'impacted']"
										:usecheckbox="false"
										:clickablecells="['impacted']"
										title="compliance_results"
										translationkey="compliance."
										:server-side="false"
										is-sticky
										@cell-click="onRuleCellClick"
									/>
								</div>
							</b-tab>
							<!-- Fin de vie des systèmes -->
							<b-tab
								:title="$t('title.compliance_eol')"
								title-item-class="ocs-menu-tab"
							>
								<section v-if="eol.errored">
									<Alert
										:message="eol.errormsg"
										:cols="true"
										variant="danger"
									/>
								</section>

								<!-- EOL summary tiles -->
								<div
									v-if="!eolSummary.loading"
									class="d-flex gap-2 mb-3 mt-3"
								>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#adb5bd', eolFilter === null)"
										@click="setEolFilter(null)"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div class="subheader mb-1">{{ $t('compliance.summary_monitored') }}</div>
											<div class="h3 mb-0">{{ eolSummary.total }}</div>
											<div class="text-muted small">
												{{ $t('compliance.eol_coverage') }} : {{ eolCoverage }}%
											</div>
										</div>
									</div>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#2fb344', eolFilter === 'supported')"
										@click="setEolFilter('supported')"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div
												class="subheader mb-1"
												:style="{ color: '#2fb344' }"
											>
												{{ $t('compliance.eol_active') }}
											</div>
											<div class="h3 mb-0" :style="{ color: '#2fb344' }">{{ eolSummary.supported }}</div>
										</div>
									</div>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#f59f00', eolFilter === 'extended')"
										@click="setEolFilter('extended')"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div
												class="subheader mb-1"
												:style="{ color: '#f59f00' }"
											>
												{{ $t('compliance.eol_extended') }}
											</div>
											<div class="h3 mb-0" :style="{ color: '#f59f00' }">{{ eolSummary.extended }}</div>
										</div>
									</div>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#d63939', eolFilter === 'expired')"
										@click="setEolFilter('expired')"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div
												class="subheader mb-1"
												:style="{ color: '#d63939' }"
											>
												{{ $t('compliance.eol_expired') }}
											</div>
											<div class="h3 mb-0" :style="{ color: '#d63939' }">{{ eolSummary.expired }}</div>
										</div>
									</div>
									<div
										class="card flex-fill"
										style="cursor: pointer;"
										:style="tileStyle('#adb5bd', eolFilter === 'unknown')"
										@click="setEolFilter('unknown')"
									>
										<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
											<div
												class="subheader mb-1"
												:style="{ color: '#adb5bd' }"
											>
												{{ $t('compliance.eol_unknown') }}
											</div>
											<div class="h3 mb-0" :style="{ color: '#adb5bd' }">{{ eolSummary.unknown }}</div>
										</div>
									</div>
								</div>

								<div
									v-if="eol.loading"
									class="ocs-loader"
								>
									<Loader />
								</div>

								<div v-else>
									<Datatable
										id="compliance-eol-datatable"
										:rowdata="eol.rowdata"
										:rowheader="eol.rowheader"
										:usecheckbox="false"
										:canaccessdetails="true"
										:isbusy="eol.isbusy"
										title="compliance_eol"
										translationkey="compliance."
										is-sticky
										@reload-datatable="reloadEol"
									/>
								</div>
							</b-tab>
						</b-tabs>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const RESULTS_ORDERING_MAP = {
	asset:        'asset__name',
	rule_name:    'rule__name',
	rule_type:    'rule__type',
	severity:     'rule__severity',
	status:       'status',
}

export default {
	name: 'ComplianceDashboard',
	data() {
		return {
			mainTab: 0,
			activeFilter: null,
			eolFilter: null,
			results: {
				errored: false,
				errormsg: null,
				loading: true,
				isbusy: true,
				rowdata: [],
				rowheader: ['asset', 'rule_name', 'rule_type', 'severity', 'status'],
				total: 0,
				query: {
					limit: localStorage.getItem('perPage') ? Number(localStorage.getItem('perPage')) : 5,
					offset: 0,
					ordering: '-evaluated_at',
					search: null,
				},
			},
			eol: {
				errored: false,
				errormsg: null,
				loading: true,
				isbusy: true,
				rowdata: [],
				rowheader: ['asset', 'eol_product', 'eol_cycle', 'eol_date', 'eol_support', 'eol_latest', 'is_eol'],
			},
			resultsSummary: {
				loading: true,
				total: 0,
				nonCompliant: 0,
				compliant: 0,
				severities: { critical: 0, high: 0, medium: 0, low: 0 },
				compliantAssets: [],
				nonCompliantAssets: [],
			},
			byrules: {
				loading: true,
				errored: false,
				errormsg: null,
				rows: [],
				filter: null,
				selectedRule: null,
				assetsRowdata: [],
				assetsLoading: false,
			},
			eolSummary: {
				loading: true,
				total: 0,
				expired: 0,
				unknown: 0,
				supported: 0,
				extended: 0,
			},
		}
	},
	computed: {
		severityTiles() {
			return [
				{ key: 'critical', label: this.$t('compliance.severity_critical'), color: '#d63939' },
				{ key: 'high',     label: this.$t('compliance.severity_high'),     color: '#f76707' },
				{ key: 'medium',   label: this.$t('compliance.severity_medium'),   color: '#f59f00' },
				{ key: 'low',      label: this.$t('compliance.severity_low'),      color: '#206bc4' },
			]
		},
		eolCoverage() {
			if (!this.eolSummary.total) return 0
			return Math.round(((this.eolSummary.supported + this.eolSummary.extended) / this.eolSummary.total) * 100)
		},
		byRulesTileCounts() {
			const counts = { critical: 0, high: 0, medium: 0, low: 0 }
			this.byrules.rows.forEach(r => {
				if (counts[r.severity] !== undefined) counts[r.severity] += 1
			})
			return counts
		},
		byrulesRowdata() {
			const order = { critical: 0, high: 1, medium: 2, low: 3 }
			return this.byrules.rows
				.filter(r => !this.byrules.filter || r.severity === this.byrules.filter)
				.sort((a, b) => (order[a.severity] ?? 99) - (order[b.severity] ?? 99))
				.map(r => ({
					id: r.rule,
					rule: r.rule,
					rule_name: r.rule_name,
					severity: this.$te('compliance.severity_' + r.severity)
						? this.$t('compliance.severity_' + r.severity)
						: r.severity,
					type: this.ruleTypeLabel(r.type),
					impacted: r.impacted,
				}))
		},
		complianceRate() {
			if (this.resultsSummary.total === 0) return 0
			return Math.round((this.resultsSummary.compliant / this.resultsSummary.total) * 100)
		},
		compliantAssetsRowdata() {
			return this.resultsSummary.compliantAssets.map(a => ({
				id:    a.id,
				asset: { id: a.id, name: a.name },
			}))
		},
		nonCompliantAssetsRowdata() {
			return this.resultsSummary.nonCompliantAssets.map(a => ({
				id:    a.id,
				asset: { id: a.id, name: a.name },
				rule:  a.ruleCount,
			}))
		},
		severityAssetsRowdata() {
			const severity = this.activeFilter?.type === 'severity' ? this.activeFilter.value : null
			if (!severity) return []
			return this.resultsSummary.nonCompliantAssets
				.filter(a => (a.counts?.[severity] || 0) > 0)
				.map(a => ({
					id:    a.id,
					asset: { id: a.id, name: a.name },
					rule:  a.counts[severity],
				}))
		},
	},
	watch: {
		// Leaving/returning to a tab clears the "By rules" drill-down so the
		// rules list is shown again instead of the previously selected rule.
		mainTab() {
			this.byrules.selectedRule = null
		},
	},
	async mounted() {
		this.activeFilter = { type: 'status', value: 'non_compliant' }
		await Promise.all([
			this.loadResults(),
			this.loadEol(),
			this.loadResultsSummary(),
			this.loadEolSummary(),
			this.loadByRules(),
		])
	},
	methods: {
		// Tile filters

		tileStyle(color, isActive) {
			return isActive
				? {
					borderTop:  '3px solid ' + color,
					borderLeft: '1px solid ' + color,
					borderRight: '1px solid ' + color,
					borderBottom: '1px solid ' + color,
					backgroundColor: color + '14',
					boxShadow: '0 2px 8px ' + color + '40',
				}
				: { borderTop: '3px solid ' + color }
		},

		setTileFilter(type, value) {
			if (this.activeFilter?.type === type && this.activeFilter?.value === value) {
				this.activeFilter = null
			} else {
				this.activeFilter = { type, value }
			}
			this.results.query = { ...this.results.query, offset: 0 }
			this.fetchResults(this.results.query)
		},

		// Results tab

		async loadResults() {
			this.results.loading = true
			this.results.isbusy = true
			try {
				await this.fetchResults(this.results.query)
			} catch (e) {
				this.results.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.results.errored = true
			} finally {
				this.results.loading = false
				this.results.isbusy = false
			}
		},

		async fetchResults(query) {
			this.results.isbusy = true
			try {
				const params = {
					limit: query.limit,
					offset: query.offset,
					ordering: query.ordering,
					search: query.search,
				}
				if (this.activeFilter?.type === 'severity') {
					params['rule__severity'] = this.activeFilter.value
					params['status'] = 'non_compliant'
				} else if (this.activeFilter?.type === 'status') {
					params['status'] = this.activeFilter.value
				}
				const data = await this.$api.generic.get(
					'compliance/results/',
					params,
					{ expand: 'rule' }
				)
				const items = data?.results || data || []
				this.results.total = typeof data?.count === 'number' ? data.count : items.length
				this.results.rowdata = this.mapResultRows(items)
				this.results.errored = false
				this.results.errormsg = null
			} catch (e) {
				this.results.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.results.errored = true
			} finally {
				this.results.isbusy = false
			}
		},

		mapResultRows(items) {
			return items.map(r => ({
				id: r.id,
				asset:        { id: r.asset, name: r.asset_name || '-' },
				rule_name:    r.rule?.name || '-',
				rule_type:    r.rule
					? (this.$te('compliance.type_' + r.rule.type)
						? this.$t('compliance.type_' + r.rule.type)
						: r.rule.type)
					: '-',
				severity:     r.rule
					? (this.$te('compliance.severity_' + r.rule.severity)
						? this.$t('compliance.severity_' + r.rule.severity)
						: r.rule.severity)
					: '-',
				status:       this.$te('compliance.' + r.status)
					? this.$t('compliance.' + r.status)
					: r.status,
			}))
		},

		async reloadResults() {
			await this.fetchResults(this.results.query)
		},

		async handleResultsQueryChange(newQuery) {
			if (this.results.isbusy) return
			if (newQuery.ordering) {
				const desc = newQuery.ordering.startsWith('-')
				const key = newQuery.ordering.replace('-', '')
				const mapped = RESULTS_ORDERING_MAP[key] || key
				newQuery.ordering = desc ? '-' + mapped : mapped
			}
			this.results.query = { ...this.results.query, ...newQuery }
			await this.fetchResults(this.results.query)
		},

		handleResultsExport({ scope, rows }) {
			const flat = rows.map(r => ({ ...r, asset: r.asset?.name ?? r.asset ?? '' }))
			this.downloadCsv(this.buildCsv(flat), `compliance_results_${scope}.csv`)
		},


		async exportAllResults({ filter, ordering }) {
			try {
				const data = await this.$api.generic.get(
					'compliance/results/',
					{ search: filter || null, ordering: ordering || null },
					{ expand: 'rule' }
				)
				const items = data?.results || data || []
				this.handleResultsExport({ scope: 'all', rows: this.mapResultRows(items) })
			} catch (e) {
				this.results.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.results.errored = true
			}
		},

		async loadByRules() {
			this.byrules.loading = true
			try {
				const data = await this.$api.generic.get('compliance/results/rule-summary/', {}, {})
				this.byrules.rows = Array.isArray(data) ? data : (data?.results || [])
				this.byrules.errored = false
				this.byrules.errormsg = null
			} catch (e) {
				this.byrules.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.byrules.errored = true
			} finally {
				this.byrules.loading = false
			}
		},

		async selectRule(rule) {
			this.byrules.selectedRule = rule
			this.byrules.assetsLoading = true
			this.byrules.assetsRowdata = []
			try {
				const data = await this.$api.generic.get(
					'compliance/results/',
					{ rule: rule.rule, status: 'non_compliant', limit: 1000 },
					{}
				)
				const items = data?.results || data || []
				this.byrules.assetsRowdata = items.map(r => ({
					id: r.asset,
					asset: { id: r.asset, name: r.asset_name || '-' },
				}))
			} catch (e) {
				this.byrules.assetsRowdata = []
			} finally {
				this.byrules.assetsLoading = false
			}
		},

		setEolFilter(type) {
			this.eolFilter = this.eolFilter === type ? null : type
			this.fetchEol()
		},

		setByRulesFilter(severity) {
			this.byrules.filter = this.byrules.filter === severity ? null : severity
		},

		onRuleCellClick(payload) {
			if (payload?.field === 'impacted') {
				this.selectRule(payload.item)
			}
		},

		onNonCompliantCellClick(payload) {
			if (payload?.field === 'rule' && payload.item?.asset?.id) {
				this.$router.push({
					path: `/inventory/asset/${payload.item.asset.id}`,
					query: { tab: 'compliance' },
				})
			}
		},

		ruleTypeLabel(type) {
			return this.$te('compliance.type_' + type)
				? this.$t('compliance.type_' + type)
				: type
		},

		async loadResultsSummary() {
			try {
				const [assetSummary, fleet] = await Promise.all([
					this.$api.generic.get('compliance/results/asset-summary/', {}, {}),
					this.$api.generic.get('asset/bases/', { limit: 1 }, {}),
				])
				const summaryItems = Array.isArray(assetSummary) ? assetSummary : []

				// Count impacted assets per severity (not rule occurrences), to
				// match the "By assets" tab and the per-severity datatable.
				const sev = { critical: 0, high: 0, medium: 0, low: 0 }
				summaryItems.forEach(s => {
					if (s.counts?.critical > 0) sev.critical += 1
					if (s.counts?.high     > 0) sev.high     += 1
					if (s.counts?.medium   > 0) sev.medium   += 1
					if (s.counts?.low      > 0) sev.low      += 1
				})

				// fleetTotal is kept as the compliance-rate denominator (coverage
				// over the whole fleet); the non-compliant tile counts only
				// assets actually flagged non compliant, to match the datatable.
				const fleetTotal      = typeof fleet?.count === 'number' ? fleet.count : summaryItems.length
				const compliantItems  = summaryItems.filter(s => s.global_status === 'compliant')
				const nonCompliantItems = summaryItems.filter(s => s.global_status === 'non_compliant')

				this.resultsSummary = {
					loading: false,
					total:        fleetTotal,
					nonCompliant: nonCompliantItems.length,
					compliant:    compliantItems.length,
					severities:   sev,
					compliantAssets: compliantItems.map(s => ({ id: s.asset, name: s.asset_name || String(s.asset) })),
					nonCompliantAssets: nonCompliantItems.map(s => ({
						id: s.asset,
						name: s.asset_name || String(s.asset),
						counts: s.counts || {},
						ruleCount: (s.counts?.critical || 0) + (s.counts?.high || 0)
							+ (s.counts?.medium || 0) + (s.counts?.low || 0),
					})),
				}
			} catch {
				this.resultsSummary.loading = false
			}
		},

		// EOL tab

		async loadEol() {
			this.eol.loading = true
			this.eol.isbusy = true
			try {
				await this.fetchEol()
			} catch (e) {
				this.eol.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.eol.errored = true
			} finally {
				this.eol.loading = false
				this.eol.isbusy = false
			}
		},

		async fetchEol() {
			this.eol.isbusy = true
			try {
				const filters = {}
				if (this.eolFilter === 'expired') {
					filters.is_eol = true
				} else if (this.eolFilter === 'extended') {
					filters.support = true
				} else if (this.eolFilter === 'unknown') {
					filters.product__isnull = true
				} else if (this.eolFilter === 'supported') {
					filters.is_eol = false
					filters.support = false
					filters.product__isnull = false
				}
				const data = await this.$api.generic.get('compliance/eol-status/', {}, filters)
				const items = Array.isArray(data) ? data : (data?.results || [])
				this.eol.rowdata = items.map(r => ({
					id: r.id,
					asset:       { id: r.asset, name: r.asset_name || '-' },
					eol_product: r.product || '-',
					eol_cycle:   r.cycle || '-',
					eol_date:    r.eol || '-',
					eol_support: r.product
						? (r.support ? (r.support_date || this.$t('generic.yes')) : this.$t('generic.no'))
						: '-',
					eol_latest:  r.latest || '-',
					is_eol:      !r.product
						? this.$t('compliance.eol_unknown')
						: r.is_eol
							? this.$t('compliance.eol_expired')
							: this.$t('compliance.eol_active'),
				}))
				this.eol.errored = false
				this.eol.errormsg = null
			} catch (e) {
				this.eol.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.eol.errored = true
			} finally {
				this.eol.isbusy = false
			}
		},

		async reloadEol() {
			await this.fetchEol()
		},

		async loadEolSummary() {
			try {
				const [all, expired, unknown, extended] = await Promise.all([
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, {}),
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, { is_eol: true }),
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, { product__isnull: true }),
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, { support: true }),
				])
				const statusTotal   = typeof all?.count      === 'number' ? all.count      : 0
				const expiredCount  = typeof expired?.count  === 'number' ? expired.count  : 0
				const unknownCount  = typeof unknown?.count  === 'number' ? unknown.count  : 0
				const extendedCount = typeof extended?.count === 'number' ? extended.count : 0
				this.eolSummary = {
					loading: false,
					total: statusTotal,
					expired: expiredCount,
					unknown: unknownCount,
					extended: extendedCount,
					supported: statusTotal - expiredCount - unknownCount - extendedCount,
				}
			} catch {
				this.eolSummary.loading = false
			}
		},

		// Shared helpers

		buildCsv(rows) {
			if (!rows?.length) return ''
			const headers = Object.keys(rows[0])
			const lines = [headers.join(';')]
			rows.forEach(row => {
				lines.push(headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(';'))
			})
			return lines.join('\n')
		},

		downloadCsv(csv, filename) {
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', filename)
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
		},
	},
}
</script>
