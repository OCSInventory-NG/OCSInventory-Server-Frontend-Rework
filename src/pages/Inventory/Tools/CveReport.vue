<template>
	<div
		id="cve-report"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="cve_report" />

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
							<div class="d-flex gap-2 mb-3">
								<div
									v-for="s in severityTiles"
									:key="s.key"
									class="card flex-fill"
									style="cursor: pointer;"
									:style="tileStyle(s.color, severityFilter === s.key)"
									@click="setSeverityFilter(s.key)"
								>
									<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
										<div
											class="subheader mb-1"
											:style="{ color: s.color }"
										>
											{{ s.label }}
										</div>
										<div class="h3 mb-0">
											{{ summary.by_severity[s.key] || 0 }}
										</div>
									</div>
								</div>
								<div
									class="card flex-fill"
									style="cursor: pointer;"
									:style="tileStyle('#adb5bd', severityFilter === null)"
									@click="setSeverityFilter(null)"
								>
									<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
										<div class="subheader mb-1">
											{{ $t('security.total_cve') }}
										</div>
										<div class="h3 mb-0">
											{{ summary.total_cves }}
										</div>
									</div>
								</div>
								<div
									class="card flex-fill"
									style="cursor: pointer;"
									:style="tileStyle('#2fb344', showVulnerableSoftware)"
									@click="toggleVulnerableSoftware"
								>
									<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
										<div class="subheader mb-1">
											{{ $t('security.vulnerable_software_count') }}
										</div>
										<div class="h3 mb-0">
											{{ summary.vulnerable_software_count }}
										</div>
									</div>
								</div>
								<div class="card flex-fill">
									<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
										<div class="subheader mb-1">
											{{ $t('security.impacted_asset_count') }}
										</div>
										<div class="h3 mb-0">
											{{ summary.impacted_asset_count }}
										</div>
									</div>
								</div>
							</div>

							<div v-if="showVulnerableSoftware">
								<Datatable
									id="cve-report-software-datatable"
									:rowdata="vulnerableSoftwareRowdata"
									:rowheader="['software_name', 'software_publisher', 'software_version', 'cve_count']"
									:usecheckbox="false"
									:canedit="false"
									:candelete="false"
									:clickablecells="['software_name', 'cve_count']"
									is-sticky
									title="cve_report"
									translationkey="security."
									sortby="cve_count"
									sortdesc="desc"
									@cell-click="onSoftwareCellClick"
								/>
							</div>

							<div v-else>
								<Datatable
									id="cve-report-datatable"
									ref="cveDatatable"
									:rowdata="filteredRowdata"
									:rowheader="rowheader"
									:usecheckbox="false"
									:canedit="false"
									:candelete="false"
									:coloredcells="['cvss_score']"
									:badgecells="['version_match']"
									:clickablecells="['software_name', 'impacted_asset_count']"
									:isbusy="isbusy"
									is-sticky
									title="cve_report"
									translationkey="security."
									sortby="cvss_score"
									sortdesc="desc"
									@reload-datatable="reloadDatatable"
									@cell-click="onCellClick"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "CveReport",
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: ["cve_id", "cvss_score", "published_date", "software_name", "software_version", "version_match", "impacted_asset_count"],
			cvereportdata: [],
			summary: {
				total_cves: 0,
				vulnerable_software_count: 0,
				impacted_asset_count: 0,
				by_severity: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 },
			},

			severityFilter: null,
			showVulnerableSoftware: false,

			isbusy: true,
			loading: true,
		}
	},
	computed: {
		severityTiles() {
			return [
				{ key: "critical", label: this.$t("compliance.severity_critical"), color: "#d63939" },
				{ key: "high", label: this.$t("compliance.severity_high"), color: "#f76707" },
				{ key: "medium", label: this.$t("compliance.severity_medium"), color: "#f59f00" },
				{ key: "low", label: this.$t("compliance.severity_low"), color: "#206bc4" },
			]
		},
		filteredRowdata() {
			if (!this.severityFilter) return this.rowdata
			return this.rowdata.filter((row) => row.__severity === this.severityFilter)
		},
		vulnerableSoftwareRowdata() {
			const groups = new Map()

			;(this.cvereportdata || []).forEach((cve) => {
				const key = [cve.software, cve.software_name, cve.software_publisher, cve.software_version].join("|")
				if (!groups.has(key)) {
					groups.set(key, {
						id: cve.software,
						software_name: cve.software_name || "-",
						software_publisher: cve.software_publisher || "-",
						software_version: cve.software_version || "-",
						cve_count: 0,
					})
				}
				groups.get(key).cve_count += 1
			})

			return Array.from(groups.values())
		},
	},
	async mounted() {
		await this.loadCveReport()
	},
	methods: {
		async loadCveReport() {
			this.loading = true
			this.isbusy = true

			try {
				// NOTE: forme de la pagination (liste brute vs. results paginés) à confirmer côté backend
				const [data, summary] = await Promise.all([
					this.$api.generic.get("security/cve-reports/"),
					this.$api.generic.get("security/cve-reports/summary/"),
				])
				this.cvereportdata = Array.isArray(data) ? data : (data?.results || [])
				this.summary = summary

				this.getRowdata()

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

		async reloadDatatable() {
			await this.loadCveReport()
		},

		getRowdata() {
			this.rowdata = (this.cvereportdata || []).map((cve) => ({
				id: cve.id,
				cve_id: cve.cve_id,
				__cellLinks: cve.cve_url ? { cve_id: { href: cve.cve_url, label: cve.cve_id } } : undefined,
				cvss_score: cve.cvss_score ?? "-",
				__cvss_score_color: this.cvssColor(cve.cvss_score),
				__severity: this.severityKey(cve.cvss_score),
				published_date: cve.published_date || "-",
				software_name: cve.software_name || "-",
				software_version: cve.software_version || "-",
				version_match: this.$te('security.version_match_' + cve.version_match + '_short')
					? this.$t('security.version_match_' + cve.version_match + '_short')
					: (cve.version_match || "-"),
				__version_match_variant: cve.version_match === 'matched' ? 'success' : 'secondary',
				impacted_asset_count: cve.impacted_asset_count ?? 0,
			}))
		},

		severityKey(score) {
			if (score === null || score === undefined) return "unknown"
			if (score >= 9) return "critical"
			if (score >= 7) return "high"
			if (score >= 4) return "medium"
			return "low"
		},

		cvssColor(score) {
			const colors = { critical: "#d63939", high: "#f76707", medium: "#f59f00", low: "#206bc4", unknown: "#6c757d" }
			return colors[this.severityKey(score)] || "#6c757d"
		},

		tileStyle(color, isActive) {
			return isActive
				? {
					borderTop: '3px solid ' + color,
					borderLeft: '1px solid ' + color,
					borderRight: '1px solid ' + color,
					borderBottom: '1px solid ' + color,
					backgroundColor: color + '14',
					boxShadow: '0 2px 8px ' + color + '40',
				}
				: { borderTop: '3px solid ' + color }
		},

		setSeverityFilter(key) {
			this.severityFilter = this.severityFilter === key ? null : key
		},

		toggleVulnerableSoftware() {
			this.showVulnerableSoftware = !this.showVulnerableSoftware
		},

		onSoftwareCellClick(payload) {
			if (payload?.field === 'software_name') {
				this.searchBySoftware(payload.item?.software_name)
			} else if (payload?.field === 'cve_count') {
				this.backToCveList(payload.item?.software_name)
			}
		},

		backToCveList(softwareName) {
			this.showVulnerableSoftware = false
			this.severityFilter = null

			this.$nextTick(() => {
				if (this.$refs.cveDatatable && softwareName) {
					this.$refs.cveDatatable.filter = softwareName
				}
			})
		},

		onCellClick(payload) {
			if (payload?.field === 'software_name' || payload?.field === 'impacted_asset_count') {
				this.searchBySoftware(payload.item?.software_name)
			}
		},

		searchBySoftware(softwareName) {
			if (!softwareName || softwareName === '-') return

			const search = [
				[
					{
						object: "software_dictionary_entries",
						route: "software_dictionary",
						field: "name",
						fieldtype: "string",
						operator: "iexact",
						value: softwareName,
						link: "AND"
					},
				]
			]

			localStorage.setItem('multisearch', JSON.stringify(search))
			localStorage.setItem('useSavedSearch', true)

			this.$router.push({ name: 'Multisearch' })
		},
	}
}
</script>
