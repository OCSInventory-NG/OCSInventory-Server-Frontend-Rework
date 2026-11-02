<template>
	<div
		id="software-identity"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="software_identity" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
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
							<div class="datagrid mb-4">
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t('software_identity.index') }}
									</div>
									<div
										class="datagrid-content"
										:class="{ 'text-warning': !summary.index.version }"
									>
										{{ indexLabel }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t('software_identity.pending') }}
									</div>
									<div
										class="datagrid-content"
										:class="{ 'text-warning': summary.pending }"
									>
										{{ summary.pending }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t('software_identity.unknown_platform') }}
									</div>
									<div
										class="datagrid-content"
										:class="{ 'text-warning': summary.machines_unknown_platform }"
									>
										{{ summary.machines_unknown_platform }}
									</div>
								</div>
							</div>

							<b-tabs
								content-class="col-10 sticky-tabs"
								pills
								card
								vertical
							>
								<b-tab
									:title="$t('software_identity.summary')"
									title-item-class="ocs-menu-tab"
								>
									<div class="hr-text mt-0">
										{{ $t('software_identity.by_platform') }}
									</div>
									<Datatable
										id="software-identity-families-datatable"
										:rowdata="familyRows"
										:rowheader="familyColumns"
										:usecheckbox="false"
										:candeletemultiple="false"
										:cansearch="false"
										title="software_identity_families"
										translationkey="software_identity.column_"
										compactheader
									/>
									<div class="hr-text">
										{{ $t('software_identity.by_origin') }}
									</div>
									<Datatable
										id="software-identity-origins-summary-datatable"
										:rowdata="originRows"
										:rowheader="['origin', 'distribution', 'installations', 'machines']"
										:usecheckbox="false"
										:candeletemultiple="false"
										title="software_identity_origins_summary"
										translationkey="software_identity.column_"
										compactheader
									/>
								</b-tab>
								<b-tab
									:title="$t('software_identity.tab_review')"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<SoftwareIdentityReview
										:key="reviewKey"
										:candecide="candecide"
										:cansearch="cansearch"
										@decided="onDecided"
									/>
								</b-tab>
								<b-tab
									:title="$t('software_identity.tab_matched')"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<SoftwareIdentityReview
										:key="matchedKey"
										status="matched"
										:candecide="candecide"
										:cansearch="cansearch"
										@decided="onDecided"
									/>
								</b-tab>
								<b-tab
									v-if="canviewdecisions"
									:title="$t('software_identity.tab_decisions')"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<SoftwareIdentityDecisions
										:key="decisionsKey"
										:candelete="candelete"
										@reverted="onReverted"
									/>
								</b-tab>
								<b-tab
									v-if="canviewaliases"
									:title="$t('software_identity.tab_aliases')"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<IdentityReferenceTable
										route="cpe_aliases"
										model="cpealias"
										:help="$t('software_identity.aliases_help')"
										:firstfields="['product', 'alias', 'source']"
										:patterns="{ product: cpeKeyPattern, alias: cpeKeyPattern }"
										:placeholders="{ product: 'zoom:zoom', alias: 'zoom:meetings' }"
										:protectedrows="{ source: 'shipped' }"
									/>
								</b-tab>
								<b-tab
									v-if="canvieworigins"
									:title="$t('software_identity.tab_origins')"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<IdentityReferenceTable
										route="package_origins"
										model="packageorigin"
										:help="$t('software_identity.origins_help')"
										:booleanlabels="{ extended: $t('software_identity.extended_repo') }"
										:badgefields="{ extended: 'bg-purple-lt' }"
										:fieldhelp="{ extended: $t('software_identity.extended_help') }"
									/>
								</b-tab>
								<b-tab
									v-if="canviewreleases"
									:title="$t('software_identity.tab_releases')"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<IdentityReferenceTable
										route="distro_releases"
										model="distrorelease"
										:help="$t('software_identity.releases_help')"
										:fieldhelp="{ standard_support_end: $t('software_identity.standard_support_end_help') }"
									/>
								</b-tab>
							</b-tabs>
						</template>
					</div>
				</div>
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
			canviewaliases: false,
			canvieworigins: false,
			canviewreleases: false,
			// vendor:product, as in the CPE index
			cpeKeyPattern: "[^:\\s]+:[^:\\s]+",

			summary: { index: {}, counts: [], pending: 0, machines_unknown_platform: 0, origins: [] },
			statuses: ["matched", "validated", "review", "none", "unsupported"],
			decisionsKey: 0,
			reviewKey: 0,
			matchedKey: 0,
		}
	},
	computed: {
		indexLabel() {
			const index = this.summary.index
			if (!index.version) {
				return this.$t("software_identity.no_index")
			}
			return `${new Date(index.source_date).toLocaleString()} (${Number(index.product_count).toLocaleString()} ${this.$t("software_identity.products")})`
		},
		familyColumns() {
			return ["platform", ...this.statuses.map((status) => "status_" + status)]
		},
		// one row per platform, one column per identity status
		familyRows() {
			const families = [...new Set(this.summary.counts.map((row) => row.family))]
			return families.map((family) => {
				const row = { id: family || "unknown", platform: this.$t("software_identity.family_" + (family || "unknown")) }
				for (const status of this.statuses) {
					const count = this.summary.counts.find((item) => item.family === family && item.status === status)
					row["status_" + status] = count ? count.count : 0
				}
				return row
			})
		},
		originRows() {
			return (this.summary.origins || []).map((row) => ({
				id: row.package_origin || "",
				origin: row.package_origin || this.$t("software_identity.no_origin"),
				distribution: row.distribution || (row.package_origin ? this.$t("software_identity.third_party") : ""),
				installations: row.installations,
				machines: row.machines,
			}))
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
		this.canviewaliases = hasPermission("software_identity_view_cpealias")
		this.canvieworigins = hasPermission("software_identity_view_packageorigin")
		this.canviewreleases = hasPermission("software_identity_view_distrorelease")

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
			// A deleted decision sends its product back to review or to matched
			this.reviewKey += 1
			this.matchedKey += 1
			await this.loadSummary()
		},
	},
}
</script>
