<template>
	<div id="asset-vulnerabilities">
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
			<div class="card mb-3">
				<div class="card-body d-flex flex-wrap gap-4">
					<div>
						<div class="subheader">
							{{ $t('security.kernel') }}
						</div>
						<div>{{ kernelLabel }}</div>
					</div>
					<div>
						<div class="subheader">
							{{ $t('security.not_checked') }}
						</div>
						<router-link to="/security/vulnerabilities">
							{{ $t('security.unchecked_software', { count: coverage.unchecked }) }}
						</router-link>
					</div>
					<div class="ms-auto text-muted">
						{{ $t('security.last_check', { date: lastCheck }) }}
					</div>
				</div>
			</div>
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
						<th>{{ $t('security.products') }}</th>
						<th>{{ $t('security.fixed_version') }}</th>
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
						<td>
							{{ row.vuln_id }}
							<span
								v-if="row.uncertain"
								class="badge bg-secondary ms-1"
								:title="$t('security.uncertain_help')"
							>
								{{ $t('security.uncertain') }}
							</span>
						</td>
						<td>
							<div
								v-for="product in row.products"
								:key="product.product + product.version"
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
						<td>
							<div
								v-for="version in row.fixed_versions"
								:key="version"
							>
								{{ version }}
							</div>
							<span v-if="!row.fixed_versions.length">{{ $t('security.no_fix') }}</span>
						</td>
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
			<VulnerabilityDetailModal
				v-if="selected"
				:vuln-id="selected"
				@closed="selected = null"
			/>
		</template>
	</div>
</template>

<script>
export default {
	name: "AssetVulnerabilities",
	props: {
		assetId: { type: Number, required: true },
	},
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			rows: [],
			total: 0,
			currentPage: 1,
			perPage: 25,
			coverage: { kernel: "not_applicable", unchecked: 0, last_check: null },
			selected: null,
		}
	},
	computed: {
		kernelLabel() {
			const state = this.coverage.kernel
			if (state === "host_or_custom" || state === "not_applicable") {
				return this.$t("security.kernel_" + state)
			}
			return this.$t("security.state_" + state)
		},
		lastCheck() {
			return this.coverage.last_check
				? new Date(this.coverage.last_check).toLocaleString()
				: this.$t("security.never")
		},
	},
	watch: {
		async currentPage() {
			await this.loadRows()
		},
	},
	async mounted() {
		try {
			const [, coverage] = await Promise.all([
				this.loadRows(),
				this.$api.generic.get("vulnerabilities/coverage/", { asset: this.assetId }),
			])
			this.coverage = coverage
		} catch (e) {
			this.errormsg = e?.response?.data?.detail || e?.message || String(e)
			this.errored = true
		} finally {
			this.loading = false
		}
	},
	methods: {
		async loadRows() {
			const data = await this.$api.generic.get("vulnerabilities/", {
				asset: this.assetId,
				limit: this.perPage,
				offset: (this.currentPage - 1) * this.perPage,
			})
			this.rows = data.results || data
			this.total = typeof data.count === "number" ? data.count : this.rows.length
		},
	},
}
</script>
