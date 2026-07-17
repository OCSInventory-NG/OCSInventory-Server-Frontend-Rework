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
						:style="activeTab === s.key ? { borderColor: s.color } : {}"
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
						:style="activeTab === 'compliant' ? { borderColor: '#2fb344' } : {}"
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
				<b-tabs v-model="activeTabIndex">
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
						<table
							v-else
							class="table table-vcenter"
						>
							<thead>
								<tr>
									<th>{{ $t('compliance.col_rule') }}</th>
									<th>{{ $t('compliance.col_type') }}</th>
									<th>{{ $t('compliance.col_severity') }}</th>
									<th>{{ $t('compliance.col_status') }}</th>
									<th>{{ $t('compliance.col_message') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="result in resultsBySeverity[s.key]"
									:key="result.id"
								>
									<td>{{ result.rule.name }}</td>
									<td>
										{{ $te('compliance.type_' + result.rule.type)
											? $t('compliance.type_' + result.rule.type)
											: result.rule.type }}
									</td>
									<td>
										<span
											style="font-weight: bold;"
											:style="{ color: s.color }"
										>{{ s.label }}</span>
									</td>
									<td>
										<span
											class="badge text-white"
											:class="result.status === 'non_compliant'
												? 'bg-danger'
												: (result.status === 'compliant' ? 'bg-success' : 'bg-secondary')"
										>
											{{ $te('compliance.' + result.status)
												? $t('compliance.' + result.status)
												: result.status }}
										</span>
									</td>
									<td class="text-muted">
										{{ result.rule.description || '-' }}
									</td>
								</tr>
							</tbody>
						</table>
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
						<table
							v-else
							class="table table-vcenter"
						>
							<thead>
								<tr>
									<th>{{ $t('compliance.col_rule') }}</th>
									<th>{{ $t('compliance.col_type') }}</th>
									<th>{{ $t('compliance.col_severity') }}</th>
									<th>{{ $t('compliance.col_status') }}</th>
									<th>{{ $t('compliance.col_message') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="result in compliantResults"
									:key="result.id"
								>
									<td>{{ result.rule.name }}</td>
									<td>
										{{ $te('compliance.type_' + result.rule.type)
											? $t('compliance.type_' + result.rule.type)
											: result.rule.type }}
									</td>
									<td>
										<span
											style="font-weight: bold;"
											:style="{ color: severities.find(
												sv => sv.key === result.rule.severity
											)?.color }"
										>
											{{ severities.find(sv => sv.key === result.rule.severity)
												?.label || result.rule.severity }}
										</span>
									</td>
									<td>
										<span class="badge text-white bg-success">
											{{ $te('compliance.' + result.status)
												? $t('compliance.' + result.status)
												: result.status }}
										</span>
									</td>
									<td class="text-muted">
										{{ result.rule.description || '-' }}
									</td>
								</tr>
							</tbody>
						</table>
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
