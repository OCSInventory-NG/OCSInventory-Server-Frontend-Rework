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
						<b-tabs>
							<!-- Résultats des règles -->
							<b-tab :title="$t('title.compliance_results')">
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
									class="row g-2 mb-3 mt-3"
								>
									<div class="col">
										<div
											class="card"
											style="border-top: 3px solid #d63939"
										>
											<div class="card-body text-center p-2">
												<div
													class="subheader mb-1"
													style="color: #d63939"
												>
													{{ $t('compliance.severity_critical') }}
												</div>
												<div class="h3 mb-0">
													{{ resultsSummary.severities.critical }}
												</div>
											</div>
										</div>
									</div>
									<div class="col">
										<div
											class="card"
											style="border-top: 3px solid #f76707"
										>
											<div class="card-body text-center p-2">
												<div
													class="subheader mb-1"
													style="color: #f76707"
												>
													{{ $t('compliance.severity_high') }}
												</div>
												<div class="h3 mb-0">
													{{ resultsSummary.severities.high }}
												</div>
											</div>
										</div>
									</div>
									<div class="col">
										<div
											class="card"
											style="border-top: 3px solid #f59f00"
										>
											<div class="card-body text-center p-2">
												<div
													class="subheader mb-1"
													style="color: #f59f00"
												>
													{{ $t('compliance.severity_medium') }}
												</div>
												<div class="h3 mb-0">
													{{ resultsSummary.severities.medium }}
												</div>
											</div>
										</div>
									</div>
									<div class="col">
										<div
											class="card"
											style="border-top: 3px solid #206bc4"
										>
											<div class="card-body text-center p-2">
												<div
													class="subheader mb-1"
													style="color: #206bc4"
												>
													{{ $t('compliance.severity_low') }}
												</div>
												<div class="h3 mb-0">
													{{ resultsSummary.severities.low }}
												</div>
											</div>
										</div>
									</div>
									<div class="col">
										<div
											class="card"
											style="border-top: 3px solid #2fb344"
										>
											<div class="card-body text-center p-2">
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
										id="compliance-results-datatable"
										:rowdata="results.rowdata"
										:rowheader="results.rowheader"
										:usecheckbox="false"
										:canaccessdetails="true"
										sortby="evaluated_at"
										sortdesc="desc"
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

							<!-- Fin de vie des systèmes -->
							<b-tab :title="$t('title.compliance_eol')">
								<section v-if="eol.errored">
									<Alert
										:message="eol.errormsg"
										:cols="true"
										variant="danger"
									/>
								</section>

								<!-- Cartes récapitulatives EOL -->
								<div
									v-if="!eolSummary.loading"
									class="row g-2 mb-3 mt-3"
								>
									<div class="col-3">
										<div class="card">
											<div class="card-body text-center p-2">
												<div class="subheader mb-1">
													{{ $t('compliance.summary_monitored') }}
												</div>
												<div class="h3 mb-0">
													{{ eolSummary.total }}
												</div>
											</div>
										</div>
									</div>
									<div class="col-3">
										<div
											class="card"
											style="border-top: 3px solid #d63939"
										>
											<div class="card-body text-center p-2">
												<div class="subheader mb-1 text-danger">
													{{ $t('compliance.eol_expired') }}
												</div>
												<div class="h3 mb-0 text-danger">
													{{ eolSummary.expired }}
												</div>
											</div>
										</div>
									</div>
									<div class="col-3">
										<div
											class="card"
											style="border-top: 3px solid #2fb344"
										>
											<div class="card-body text-center p-2">
												<div class="subheader mb-1 text-success">
													{{ $t('compliance.eol_active') }}
												</div>
												<div class="h3 mb-0 text-success">
													{{ eolSummary.active }}
												</div>
											</div>
										</div>
									</div>
									<div class="col-3">
										<div
											class="card"
											style="border-top: 3px solid #adb5bd"
										>
											<div class="card-body text-center p-2">
												<div class="subheader mb-1 text-muted">
													{{ $t('compliance.eol_unknown') }}
												</div>
												<div class="h3 mb-0 text-muted">
													{{ eolSummary.unknown }}
												</div>
											</div>
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
	evaluated_at: 'evaluated_at',
}

export default {
	name: 'ComplianceDashboard',
	data() {
		return {
			results: {
				errored: false,
				errormsg: null,
				loading: true,
				isbusy: true,
				rowdata: [],
				rowheader: ['asset', 'rule_name', 'rule_type', 'severity', 'status', 'evaluated_at'],
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
			},
			eolSummary: {
				loading: true,
				total: 0,
				expired: 0,
				unknown: 0,
				active: 0,
			},
		}
	},
	computed: {
		complianceRate() {
			if (this.resultsSummary.total === 0) return 0
			return Math.round((this.resultsSummary.compliant / this.resultsSummary.total) * 100)
		},
	},
	async mounted() {
		await Promise.all([
			this.loadResults(),
			this.loadEol(),
			this.loadResultsSummary(),
			this.loadEolSummary(),
		])
	},
	methods: {
		// ── Results tab ──────────────────────────────────────────────

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
				const data = await this.$api.generic.get(
					'compliance/results/',
					{
						limit: query.limit,
						offset: query.offset,
						ordering: query.ordering,
						search: query.search,
					},
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
				evaluated_at: r.evaluated_at
					? new Date(r.evaluated_at).toLocaleString(this.$i18n.locale)
					: '-',
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

		async loadResultsSummary() {
			try {
				const [page, assetSummary] = await Promise.all([
					this.$api.generic.get('compliance/results/', { limit: 1 }, {}),
					this.$api.generic.get('compliance/results/asset-summary/', {}, {}),
				])
				const total = typeof page?.count === 'number' ? page.count : 0
				const sev = { critical: 0, high: 0, medium: 0, low: 0 }
				;(Array.isArray(assetSummary) ? assetSummary : []).forEach(s => {
					sev.critical += s.counts?.critical || 0
					sev.high     += s.counts?.high     || 0
					sev.medium   += s.counts?.medium   || 0
					sev.low      += s.counts?.low      || 0
				})
				const nonCompliant = sev.critical + sev.high + sev.medium + sev.low
				this.resultsSummary = {
					loading: false,
					total,
					nonCompliant,
					compliant: total - nonCompliant,
					severities: sev,
				}
			} catch {
				this.resultsSummary.loading = false
			}
		},

		// ── EOL tab ──────────────────────────────────────────────────

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
				const data = await this.$api.generic.get('compliance/eol-status/', {}, {})
				const items = Array.isArray(data) ? data : (data?.results || [])
				this.eol.rowdata = items.map(r => ({
					id: r.id,
					asset:       { id: r.asset, name: r.asset_name || '-' },
					eol_product: r.product || '-',
					eol_cycle:   r.cycle || '-',
					eol_date:    r.eol || '-',
					eol_support: r.support || '-',
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
				const [all, expired, unknown] = await Promise.all([
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, {}),
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, { is_eol: true }),
					this.$api.generic.get('compliance/eol-status/', { limit: 1 }, { product__isnull: true }),
				])
				const total        = typeof all?.count     === 'number' ? all.count     : 0
				const expiredCount = typeof expired?.count === 'number' ? expired.count : 0
				const unknownCount = typeof unknown?.count === 'number' ? unknown.count : 0
				this.eolSummary = {
					loading: false,
					total,
					expired: expiredCount,
					unknown: unknownCount,
					active:  total - expiredCount - unknownCount,
				}
			} catch {
				this.eolSummary.loading = false
			}
		},

		// ── Shared helpers ───────────────────────────────────────────

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
