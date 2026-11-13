<template>
	<div id="software-identity-decisions">
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<Datatable
			v-if="ready"
			id="software-identity-decisions-datatable"
			:rowdata="rowdata"
			:rowheader="columns"
			:candelete="candelete"
			:candeletemultiple="false"
			:usecheckbox="false"
			:isbusy="loading"
			:emptytext="$t('software_identity.decisions_empty')"
			title="software_identity_decisions"
			translationkey="software_identity.column_"
			compactheader
			@reload-datatable="onDeleted"
		>
			<template #cell(source)="{ row }">
				{{ $t('software_identity.source_' + row.item.source_key) }}
				<span
					v-if="row.item.replaced"
					class="badge bg-secondary-lt ms-1"
					:title="$t('software_identity.replaced_help')"
				>{{ $t('software_identity.replaced') }}</span>
			</template>
			<template #cell(created)="{ row }">
				<span class="text-nowrap">{{ new Date(row.item.created).toLocaleString() }}</span>
			</template>
		</Datatable>
		<div
			v-else
			class="ocs-loader"
		>
			<Loader />
		</div>
	</div>
</template>

<script>
export default {
	name: "SoftwareIdentityDecisions",
	props: {
		candelete: { type: Boolean, default: false },
	},
	emits: ["reverted"],
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			ready: false,
			columns: ["family", "match_key", "product", "source", "created"],
			decisions: [],
		}
	},
	computed: {
		// shipped decisions cannot be deleted; created_at is drawn by the datatable itself, renamed
		rowdata() {
			return this.decisions.map((decision) => ({
				id: decision.id,
				name: decision.match_key,
				family: this.$t("software_identity.family_" + decision.family),
				match_key: decision.match_key,
				product: decision.product || this.$t("software_identity.no_cpe"),
				source: this.$t("software_identity.source_" + decision.source),
				source_key: decision.source,
				replaced: this.isReplaced(decision),
				created: decision.created_at,
				is_protected: decision.source !== "admin",
			}))
		},
	},
	async mounted() {
		await this.load()
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.response?.data?.detail || e?.response?.data?.[0] || e?.message || String(e)
		},

		async load() {
			this.loading = true
			try {
				this.decisions = await this.$api.generic.get("software_identity_decisions/")
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
				this.ready = true
			}
		},

		// An admin decision on the same software replaces the shipped one
		isReplaced(decision) {
			return decision.source === "shipped" && this.decisions.some((other) =>
				other.source === "admin" && other.family === decision.family && other.match_key === decision.match_key
			)
		},

		// the datatable deleted a decision (or asks for a reload)
		async onDeleted() {
			this.$emit("reverted")
			await this.load()
		},
	},
}
</script>
