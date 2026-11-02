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
			<template #cell(candidates)="{ row }">
				<div
					v-for="candidate in row.item.candidates"
					:key="candidate.product"
					class="identity-candidate"
				>
					<span class="identity-candidate-name">{{ candidate.product }}</span>
					<span
						class="badge bg-blue-lt"
						:title="$t('software_identity.score')"
					>{{ candidate.score.toFixed(2) }}</span>
					<button
						v-if="candecide"
						class="btn btn-ghost-success btn-sm px-1"
						:title="$t('software_identity.accept')"
						@click="decide(row.item, candidate.product)"
					>
						<font-awesome-icon :icon="['fas', 'check']" />
					</button>
				</div>
			</template>
			<template #cell(decision)="{ row }">
				<v-select
					:options="productOptions"
					:filterable="false"
					:placeholder="$t('software_identity.other_product')"
					class="identity-product-search"
					@search="searchProducts"
					@option:selected="(option) => decide(row.item, option.value)"
				>
					<template #no-options>
						{{ $t('software_identity.type_to_search') }}
					</template>
				</v-select>
			</template>
			<template #cell(firstActions)="{ row }">
				<button
					class="btn btn-ghost-danger"
					:title="$t('software_identity.no_cpe')"
					@click="decide(row.item, null)"
				>
					<font-awesome-icon :icon="['fas', 'xmark']" />
				</button>
			</template>
		</Datatable>
	</div>
</template>

<script>
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

			productOptions: [],
			searchTimer: null,
		}
	},
	computed: {
		columns() {
			const columns = ["software", "family", "versions", "machines"]
			if (this.status === "matched") columns.push("product")
			columns.push("candidates")
			// another product from the CPE index, when the user can search it
			if (this.candecide && this.cansearch) columns.push("decision")
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
	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},
	methods: {
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

		searchProducts(text, toggleLoading) {
			clearTimeout(this.searchTimer)
			if (!text || text.length < 2) {
				return
			}
			this.searchTimer = setTimeout(async () => {
				toggleLoading(true)
				try {
					const data = await this.$api.generic.get("cpe_products/", { search: text, limit: 20 })
					this.productOptions = (data.results || data).map((product) => ({
						label: product.key,
						value: product.key,
					}))
				} catch (e) {
					this.errormsg = this._apiError(e)
					this.errored = true
				} finally {
					toggleLoading(false)
				}
			}, 300)
		},

		async decide(row, product) {
			try {
				await this.$api.generic.post("software_identity_decisions/", {
					family: row.family,
					match_key: row.match_key,
					product,
				})
				this.$emit("decided")
				// a decided row leaves the list: the last one of a page sends back one page
				if (this.rows.length === 1 && this.query.offset > 0) {
					this.query = { ...this.query, offset: Math.max(0, this.query.offset - this.query.limit) }
				}
				await this.load()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},
	},
}
</script>
