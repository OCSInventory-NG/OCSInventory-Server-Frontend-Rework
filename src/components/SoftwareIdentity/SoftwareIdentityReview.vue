<template>
	<div id="software-identity-review">
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<Datatable
			:id="'software-identity-' + status + '-datatable'"
			:rowdata="rowdata"
			:rowheader="columns"
			:nonsortablefields="columns"
			:usecheckbox="false"
			:candeletemultiple="false"
			:hascustomactions="candecide"
			:cansearch="false"
			:canexport="false"
			:server-side="true"
			:server-total-rows="total"
			:isbusy="loading"
			:emptytext="$t(status === 'matched' ? 'software_identity.matched_empty' : 'software_identity.review_empty')"
			:title="'software_identity_' + status"
			translationkey="software_identity.column_"
			compactheader
			@change-query="onQueryChange"
			@reload-datatable="load"
		>
			<template #cell(family)="{ row }">
				{{ $t('software_identity.family_' + row.item.family) }}
			</template>
			<template #cell(product)="{ row }">
				{{ cpeLabel(row.item.product) }}
			</template>
			<!-- the best candidate, the others counted: the choice is made in the modal -->
			<template #cell(candidates)="{ row }">
				<template v-if="row.item.candidates.length">
					<span>{{ cpeLabel(row.item.candidates[0].product) }}</span>
					<span
						class="badge bg-blue-lt ms-1"
						:title="$t('software_identity.score')"
					>{{ row.item.candidates[0].score.toFixed(2) }}</span>
					<div
						v-if="row.item.candidates.length > 1"
						class="text-muted small"
					>
						{{ $t('software_identity.more_candidates', { count: row.item.candidates.length - 1 }, row.item.candidates.length - 1) }}
					</div>
				</template>
			</template>
			<template #cell(firstActions)="{ row }">
				<button
					class="btn btn-ghost-dark"
					:title="$t('software_identity.decide_title')"
					@click="openDecision(row.item)"
				>
					<font-awesome-icon :icon="['fas', 'pencil']" />
				</button>
			</template>
		</Datatable>

		<IdentityDecisionModal
			v-model="decisionShown"
			:software="deciding"
			:cansearch="cansearch"
			@decided="onDecided"
		/>
	</div>
</template>

<script>
import { cpeLabel } from "@/utils/security"

export default {
	name: "SoftwareIdentityReview",
	props: {
		candecide: { type: Boolean, default: false },
		cansearch: { type: Boolean, default: false },
		// review: waiting for an admin; matched: identified automatically
		status: { type: String, default: "review" },
	},
	emits: ["decided"],
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,

			rows: [],
			total: 0,
			// page given by the datatable
			query: { limit: Number(localStorage.getItem("perPage")) || 5, offset: 0 },
			request: 0,

			decisionShown: false,
			deciding: null,
		}
	},
	computed: {
		columns() {
			const columns = ["software", "family", "versions", "machines"]
			if (this.status === "matched") columns.push("product")
			columns.push("candidates")
			return columns
		},
		rowdata() {
			return this.rows.map((row) => ({
				...row,
				id: row.family + "|" + row.match_key,
				software: row.name,
				versions: row.entries,
			}))
		},
	},
	async mounted() {
		await this.load()
	},
	methods: {
		cpeLabel,

		_apiError(e) {
			return e?.response?.data?.error || e?.response?.data?.detail || e?.response?.data?.[0] || e?.message || String(e)
		},

		async onQueryChange(query) {
			this.query = { limit: query.limit, offset: query.offset }
			await this.load()
		},

		async load() {
			this.loading = true
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("software_identities/review/", {
					status: this.status,
					limit: this.query.limit,
					offset: this.query.offset,
				})
				if (request !== this.request) return
				this.rows = data.results || data
				this.total = typeof data.count === "number" ? data.count : this.rows.length
				this.errored = false
			} catch (e) {
				if (request !== this.request) return
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				if (request === this.request) this.loading = false
			}
		},

		openDecision(row) {
			this.deciding = row
			this.decisionShown = true
		},

		async onDecided() {
			this.$emit("decided")
			// a decided row leaves the list: the last one of a page sends back one page
			if (this.rows.length === 1 && this.query.offset > 0) {
				this.query = { ...this.query, offset: Math.max(0, this.query.offset - this.query.limit) }
			}
			await this.load()
		},
	},
}
</script>
