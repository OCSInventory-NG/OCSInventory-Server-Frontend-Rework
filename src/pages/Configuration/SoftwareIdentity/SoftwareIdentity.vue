<template>
	<div
		id="software-identity"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="software_identity" />

			<div class="page-body">
				<div v-if="errored">
					<Alert
						:message="errormsg"
						:cols="true"
						variant="danger"
					/>
				</div>

				<div
					v-else-if="loading"
					class="ocs-loader"
				>
					<Loader />
				</div>

				<template v-else>
					<div class="card mb-3">
						<div class="card-header">
							<h3 class="card-title">
								{{ $t('software_identity.summary') }}
							</h3>
						</div>
						<div class="card-body">
							<table class="table table-sm table-striped table-vcenter">
								<tbody>
									<tr>
										<td>{{ $t('software_identity.index') }}</td>
										<td>{{ indexLabel }}</td>
									</tr>
									<tr>
										<td>{{ $t('software_identity.pending') }}</td>
										<td>{{ summary.pending }}</td>
									</tr>
									<tr>
										<td>{{ $t('software_identity.unknown_platform') }}</td>
										<td>{{ summary.machines_unknown_platform }}</td>
									</tr>
								</tbody>
							</table>
							<table
								v-if="families.length"
								class="table table-sm table-striped table-vcenter"
							>
								<thead>
									<tr>
										<th>{{ $t('software_identity.family') }}</th>
										<th
											v-for="status in statuses"
											:key="status"
										>
											{{ $t('software_identity.status_' + status) }}
										</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="family in families"
										:key="family"
									>
										<td>{{ familyLabel(family) }}</td>
										<td
											v-for="status in statuses"
											:key="status"
										>
											{{ count(family, status) }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div class="card">
						<div class="card-body">
							<b-tabs
								content-class="col-10 sticky-tabs"
								pills
								card
								vertical
							>
								<b-tab
									:title="$t('software_identity.tab_review')"
									title-item-class="ocs-menu-tab"
								>
									<SoftwareIdentityReview
										:key="reviewKey"
										:candecide="candecide"
										:cansearch="cansearch"
										@decided="onDecided"
									/>
								</b-tab>
								<b-tab
									v-if="canviewdecisions"
									:title="$t('software_identity.tab_decisions')"
									title-item-class="ocs-menu-tab"
								>
									<SoftwareIdentityDecisions
										:key="decisionsKey"
										:candelete="candelete"
										@reverted="onReverted"
									/>
								</b-tab>
							</b-tabs>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

export default {
	name: "SoftwareIdentity",
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,

			candecide: false,
			candelete: false,
			canviewdecisions: false,
			cansearch: false,

			summary: { index: {}, counts: [], pending: 0, machines_unknown_platform: 0 },
			statuses: ["matched", "validated", "review", "none", "unsupported"],
			decisionsKey: 0,
			reviewKey: 0,
		}
	},
	computed: {
		families() {
			return [...new Set(this.summary.counts.map((row) => row.family))]
		},
		indexLabel() {
			const index = this.summary.index
			if (!index.version) {
				return this.$t("software_identity.no_index")
			}
			return `${new Date(index.source_date).toLocaleString()} (${index.product_count} ${this.$t("software_identity.products")})`
		},
	},
	async mounted() {
		if (!hasPermission("software_identity_view_softwareidentity")) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			return
		}
		this.candecide = hasPermission("software_identity_add_identitydecision")
		this.candelete = hasPermission("software_identity_delete_identitydecision")
		this.canviewdecisions = hasPermission("software_identity_view_identitydecision")
		this.cansearch = hasPermission("software_identity_view_cpeproduct")

		await this.loadSummary()
		this.loading = false
	},
	methods: {
		async loadSummary() {
			try {
				this.summary = await this.$api.generic.get("software_identities/summary/")
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.response?.data?.detail || e?.response?.data?.[0] || e?.message || String(e)
				this.errored = true
			}
		},
		async onDecided() {
			this.decisionsKey += 1
			await this.loadSummary()
		},
		async onReverted() {
			this.reviewKey += 1
			await this.loadSummary()
		},
		count(family, status) {
			const row = this.summary.counts.find((item) => item.family === family && item.status === status)
			return row ? row.count : 0
		},
		familyLabel(family) {
			return this.$t("software_identity.family_" + (family || "unknown"))
		},
	},
}
</script>
