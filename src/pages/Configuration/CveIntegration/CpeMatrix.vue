<template>
	<div
		id="cpe-matrix"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="cpe_matrix" />

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
							<b-row class="mb-3">
								<b-col cols="auto">
									<v-select
										id="status-filter"
										v-model="statusFilter"
										:options="statusOptions"
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										style="min-width: 260px;"
										@option:selected="reloadDatatable"
									/>
								</b-col>
								<b-col
									v-if="selected.length > 0 && canedit"
									cols="auto"
									class="ms-auto d-flex align-items-center"
								>
									<b-button
										variant="success"
										class="me-2"
										:disabled="bulkloading"
										@click="bulkReview('confirm')"
									>
										{{ $t('security.confirm_selection') }}
									</b-button>
									<b-button
										variant="danger"
										:disabled="bulkloading"
										@click="bulkReview('reject')"
									>
										{{ $t('security.reject_selection') }}
									</b-button>
								</b-col>
							</b-row>

							<Datatable
								id="cpe-matrix-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:usecheckbox="canedit"
								:isbusy="isbusy"
								:badgecells="['status']"
								is-sticky
								editcomponent="CpeMatchModal"
								title="cpe_matrix"
								translationkey="security."
								@reload-datatable="reloadDatatable"
								@attribute-package="onSelectionChanged"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "CpeMatrix",
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,

			rowdata: [],
			rowheader: [],
			cpematchdata: [],
			selected: [],

			statusFilter: "pending_review",
			statusFilterMap: {
				pending_review: ["pending_review"],
				no_match: ["no_match"],
				confirmed: ["confirmed"],
				rejected: ["rejected"],
			},

			isbusy: true,
			loading: true,
			bulkloading: false,
		}
	},
	computed: {
		statusOptions() {
			return [
				{ value: "pending_review", text: this.$t("security.pending_review") },
				{ value: "no_match", text: this.$t("security.no_match") },
				{ value: "confirmed", text: this.$t("security.confirmed") },
				{ value: "rejected", text: this.$t("security.rejected") },
			]
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		// NOTE: codenames de permission à confirmer contre le modèle CpeMatchViewSet
		// (label d'app Django pour ce ViewSet, ex. security_view_cpematch).
		if (permissions.includes("security_view_cpematch")) {
			this.canview = true
			if (permissions.includes("security_add_cpematch")) {
				this.canadd = true
			}
			if (permissions.includes("security_change_cpematch")) {
				this.canedit = true
			}
			if (permissions.includes("security_delete_cpematch")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			try {
				this.rowheader = ["id", "software_name", "software_publisher", "cpe", "cpe_rank", "status", "source"]

				// Get cpe matches
				await this.getCpeMatch()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getCpeMatch() {
			this.isbusy = true
			this.cpematchdata = []

			try {
				// L'API n'accepte qu'un seul status à la fois (ChoiceField) : une requête par statut du filtre.
				const statuses = this.statusFilterMap[this.statusFilter] || []
				const results = await Promise.all(
					statuses.map((status) => this.$api.generic.get("security/cpe-matches/", { status }))
				)

				this.cpematchdata = results.flatMap((data) => Array.isArray(data) ? data : (data?.results || []))

				// Get row data
				this.getRowdata()

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		getRowdata() {
			this.rowdata = (this.cpematchdata || [])
				.map((cm) => ({
					id: cm.id,
					software_name: cm.software_name || "-",
					software_publisher: cm.software_publisher || "-",
					cpe: cm.cpe || "-",
					cpe_rank: cm.cpe_rank,
					status: this.$te('security.' + cm.status) ? this.$t('security.' + cm.status) : cm.status,
					__status_variant: this.statusVariant(cm.status),
					source: this.$te('security.source_' + cm.source) ? this.$t('security.source_' + cm.source) : (cm.source || "-"),
				}))

			this.isbusy = false
		},

		statusVariant(status) {
			switch (status) {
				case "confirmed":
					return "success"
				case "pending_review":
					return "warning"
				case "rejected":
					return "danger"
				case "no_match":
				default:
					return "secondary"
			}
		},

		async bulkReview(decision) {
			if (this.selected.length === 0) return

			this.bulkloading = true
			try {
				// NOTE: action bulk-review à confirmer sur CpeMatchViewSet côté backend
				await this.$api.generic.post("security/cpe-matches/bulk-review/", {
					ids: this.selected.map((item) => item.id),
					decision,
				})

				this.selected = []
				await this.getCpeMatch()

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.bulkloading = false
			}
		},

		onSelectionChanged(selectedItems) {
			this.selected = selectedItems
		},

		async reloadDatatable() {
			await this.getCpeMatch()
		}
	}
}
</script>
