<template>
	<div id="compliance-detail">
		<div
			v-if="loading"
			class="ocs-loader"
		>
			<Loader />
		</div>

		<Alert
			v-else-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>

		<div v-else>
			<b-row class="mb-3">
				<b-col cols="3">
					<div class="card h-100">
						<div class="card-body">
							<div class="subheader mb-2">
								{{ $t('compliance.global_status') }}
							</div>
							<div class="d-flex align-items-center">
								<font-awesome-icon
									v-if="globalStatus === 'non_compliant'"
									:icon="['fas', 'circle-xmark']"
									class="text-danger"
									size="2x"
								/>
								<font-awesome-icon
									v-else-if="globalStatus === 'compliant'"
									:icon="['fas', 'circle-check']"
									class="text-success"
									size="2x"
								/>
								<font-awesome-icon
									v-else
									:icon="['fas', 'circle-question']"
									class="text-muted"
									size="2x"
								/>
								<div class="ms-3">
									<div
										class="h3 mb-0"
										:class="{
											'text-danger': globalStatus === 'non_compliant',
											'text-success': globalStatus === 'compliant',
										}"
									>
										{{ globalStatusLabel }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</b-col>

				<b-col class="d-flex gap-2">
					<div
						v-for="s in severities"
						:key="s.key"
						class="card flex-fill"
						style="cursor: pointer;"
						:style="tileStyle(s.color, activeTab === s.key)"
						@click="activeTab = s.key"
					>
						<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
							<div
								class="subheader mb-1"
								:style="{ color: s.color }"
							>
								{{ s.label }}
							</div>
							<div class="h1 mb-0">
								{{ counts[s.key] }}
							</div>
						</div>
					</div>
					<div
						class="card flex-fill"
						style="cursor: pointer;"
						:style="tileStyle('#2fb344', activeTab === 'compliant')"
						@click="activeTab = 'compliant'"
					>
						<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
							<div
								class="subheader mb-1"
								style="color: #2fb344"
							>
								{{ $t('compliance.compliant') }}
							</div>
							<div class="h1 mb-0">
								{{ compliantResults.length }}
							</div>
						</div>
					</div>
				</b-col>
			</b-row>

			<div class="card mt-3">
				<div class="card-body">
					<div
						v-if="eolData && eolData.product"
						class="datagrid"
					>
						<div class="datagrid-item">
							<div class="datagrid-title">
								{{ $t('compliance.eol_product') }}
							</div>
							<div class="datagrid-content">
								{{ eolData.product || '-' }}
							</div>
						</div>
						<div class="datagrid-item">
							<div class="datagrid-title">
								{{ $t('compliance.eol_cycle') }}
							</div>
							<div class="datagrid-content">
								{{ eolData.cycle || '-' }}
							</div>
						</div>
						<div class="datagrid-item">
							<div class="datagrid-title">
								{{ $t('compliance.eol_date') }}
							</div>
							<div class="datagrid-content">
								<span :class="eolData.is_eol ? 'text-danger fw-bold' : ''">
									{{ eolData.eol || '-' }}
								</span>
							</div>
						</div>
						<div class="datagrid-item">
							<div class="datagrid-title">
								{{ $t('compliance.eol_support') }}
							</div>
							<div class="datagrid-content">
								{{ eolData.product ? (eolData.support ? $t('generic.yes') : $t('generic.no')) : '-' }}
							</div>
						</div>
						<div class="datagrid-item">
							<div class="datagrid-title">
								{{ $t('compliance.eol_latest') }}
							</div>
							<div class="datagrid-content">
								{{ eolData.latest || '-' }}
							</div>
						</div>
						<div class="datagrid-item">
							<div class="datagrid-title">
								{{ $t('compliance.col_status') }}
							</div>
							<div class="datagrid-content">
								<span :class="eolData.is_eol ? 'badge bg-danger' : 'badge bg-success'">
									{{ eolData.is_eol ? $t('compliance.eol_expired') : $t('compliance.eol_active') }}
								</span>
							</div>
						</div>
					</div>
					<div
						v-else-if="!eolData"
						class="text-muted"
					>
						{{ $t('compliance.eol_no_data') }}
					</div>
					<div
						v-else
						class="text-muted"
					>
						{{ $t('compliance.eol_unknown') }}
					</div>
				</div>
			</div>

			<div
				v-if="results.length > 0"
				class="mt-4"
			>
				<b-tabs v-model="activeTabIndex" fill content-class="mt-2">
					<b-tab
						v-for="s in severities"
						:key="s.key"
						:title="s.label + (counts[s.key] > 0 ? ' (' + counts[s.key] + ')' : '')"
					>
						<div
							v-if="resultsBySeverity[s.key].length === 0"
							class="text-center text-muted py-4"
						>
							<font-awesome-icon
								:icon="['fas', 'circle-check']"
								class="text-success me-2"
							/>
							{{ $t('compliance.no_issues_for_severity') }}
						</div>
						<Datatable
							v-else
							:id="'compliance-detail-' + s.key"
							:rowdata="toRows(resultsBySeverity[s.key])"
							:rowheader="['rule_name', 'type', 'severity', 'status']"
							:badgecells="['status']"
							:coloredcells="['severity']"
							:usecheckbox="false"
							title="compliance_results"
							translationkey="compliance."
							:server-side="false"
						/>
					</b-tab>
					<b-tab
						:title="$t('compliance.compliant')
							+ (compliantResults.length > 0 ? ' (' + compliantResults.length + ')' : '')"
					>
						<div
							v-if="compliantResults.length === 0"
							class="text-center text-muted py-4"
						>
							<font-awesome-icon
								:icon="['fas', 'circle-check']"
								class="text-success me-2"
							/>
							{{ $t('compliance.no_issues_for_severity') }}
						</div>
						<Datatable
							v-else
							:id="'compliance-detail-compliant'"
							:rowdata="toRows(compliantResults)"
							:rowheader="['rule_name', 'type', 'severity', 'status']"
							:badgecells="['status']"
							:coloredcells="['severity']"
							:usecheckbox="false"
							title="compliance_results"
							translationkey="compliance."
							:server-side="false"
						/>
					</b-tab>
				</b-tabs>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ComplianceDetail',
	props: {
		assetId: { type: [Number, String], required: true },
	},
	data() {
		return {
			loading: true,
			errored: false,
			errormsg: null,

			results: [],
			activeTab: 'critical',
			eolData: null,
		}
	},
	computed: {
		severities() {
			return [
				{ key: 'critical', label: this.$t('compliance.severity_critical'), color: '#d63939' },
				{ key: 'high',     label: this.$t('compliance.severity_high'),     color: '#f76707' },
				{ key: 'medium',   label: this.$t('compliance.severity_medium'),   color: '#f59f00' },
				{ key: 'low',      label: this.$t('compliance.severity_low'),      color: '#206bc4' },
			]
		},
		globalStatus() {
			if (!this.results.length) return 'not_applicable'
			if (this.results.some(r => r.status === 'non_compliant')) return 'non_compliant'
			return 'compliant'
		},
		globalStatusLabel() {
			const map = {
				non_compliant:  this.$t('compliance.non_compliant'),
				compliant:      this.$t('compliance.compliant'),
				not_applicable: this.$t('compliance.not_applicable'),
			}
			return map[this.globalStatus] || this.globalStatus
		},
		counts() {
			const c = { critical: 0, high: 0, medium: 0, low: 0 }
			this.results
				.filter(r => r.status === 'non_compliant' && r.rule)
				.forEach(r => {
					if (c[r.rule.severity] !== undefined) c[r.rule.severity]++
				})
			return c
		},
		compliantResults() {
			return this.results.filter(r => r.rule && r.status === 'compliant')
		},
		resultsBySeverity() {
			const groups = { critical: [], high: [], medium: [], low: [] }
			this.results
				.filter(r => r.rule && r.status === 'non_compliant')
				.forEach(r => {
					if (groups[r.rule.severity]) groups[r.rule.severity].push(r)
				})
			const statusOrder = { non_compliant: 0, unknown: 1 }
			Object.values(groups).forEach(g => g.sort((a, b) =>
				(statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2)
			))
			return groups
		},
		activeTabIndex: {
			get() {
				if (this.activeTab === 'compliant') return this.severities.length
				return this.severities.findIndex(s => s.key === this.activeTab)
			},
			set(idx) {
				if (idx === this.severities.length) {
					this.activeTab = 'compliant'
				} else {
					this.activeTab = this.severities[idx]?.key || 'critical'
				}
			},
		},
	},
	async mounted() {
		await Promise.all([this.loadResults(), this.loadEolStatus()])
	},
	methods: {
		tileStyle(color, isActive) {
			return isActive
				? {
					border: '1px solid ' + color,
					borderTop: '3px solid ' + color,
					backgroundColor: color + '14',
					boxShadow: '0 2px 8px ' + color + '40',
				}
				: { borderTop: '3px solid ' + color }
		},

		toRows(list) {
			return (list || []).map(r => {
				const sev = this.severities.find(sv => sv.key === r.rule?.severity)
				return {
					id: r.id,
					rule_name: r.rule?.name || '-',
					type: this.$te('compliance.type_' + r.rule?.type)
						? this.$t('compliance.type_' + r.rule?.type)
						: (r.rule?.type || '-'),
					severity: sev?.label || r.rule?.severity || '-',
					__severity_color: sev?.color || '#6c757d',
					status: this.$te('compliance.' + r.status)
						? this.$t('compliance.' + r.status)
						: r.status,
					__status_variant: r.status === 'non_compliant'
						? 'danger'
						: (r.status === 'compliant' ? 'success' : 'secondary'),
				}
			})
		},

		async loadEolStatus() {
			try {
				const data = await this.$api.generic.get(
					'compliance/eol-status/',
					{},
					{ asset: this.assetId }
				)
				const results = Array.isArray(data) ? data : (data?.results || [])
				this.eolData = results[0] ?? null
			} catch {
				// non-blocking
			}
		},

		async loadResults() {
			this.loading = true
			this.errored = false
			this.errormsg = null

			try {
				const data = await this.$api.generic.get(
					'compliance/results/',
					{ asset: this.assetId },
					{ expand: 'rule' }
				)
				this.results = Array.isArray(data) ? data : (data?.results || [])
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},
	},
}
</script>
