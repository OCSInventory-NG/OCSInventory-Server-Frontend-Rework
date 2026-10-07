<template>
	<div id="software-identity-review">
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<div
			v-if="loading"
			class="ocs-loader"
		>
			<Loader />
		</div>
		<div v-else>
			<p v-if="!rows.length">
				{{ $t('software_identity.review_empty') }}
			</p>
			<table
				v-else
				class="table table-sm table-striped table-vcenter"
			>
				<thead>
					<tr>
						<th>{{ $t('software_identity.name') }}</th>
						<th>{{ $t('software_identity.family') }}</th>
						<th>{{ $t('software_identity.versions') }}</th>
						<th>{{ $t('software_identity.machines') }}</th>
						<th>{{ $t('software_identity.candidates') }}</th>
						<th v-if="candecide" />
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="row in rows"
						:key="row.family + row.match_key"
					>
						<td>{{ row.name }}</td>
						<td>{{ $t('software_identity.family_' + row.family) }}</td>
						<td>{{ row.entries }}</td>
						<td>{{ row.machines }}</td>
						<td>
							<div
								v-for="candidate in row.candidates"
								:key="candidate.product"
							>
								<b-button
									v-if="candecide"
									size="sm"
									variant="outline-primary"
									class="mb-1"
									:title="$t('software_identity.accept')"
									@click="decide(row, candidate.product)"
								>
									<font-awesome-icon :icon="['fas', 'check']" />
									{{ candidate.product }} ({{ candidate.score.toFixed(2) }})
								</b-button>
								<span v-else>{{ candidate.product }} ({{ candidate.score.toFixed(2) }})</span>
							</div>
						</td>
						<td v-if="candecide">
							<v-select
								v-if="cansearch"
								:options="productOptions"
								:filterable="false"
								:placeholder="$t('software_identity.other_product')"
								class="mb-1"
								@search="searchProducts"
								@option:selected="(option) => decide(row, option.value)"
							/>
							<b-button
								size="sm"
								variant="outline-danger"
								@click="decide(row, null)"
							>
								<font-awesome-icon :icon="['fas', 'xmark']" />
								{{ $t('software_identity.no_cpe') }}
							</b-button>
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
		</div>
	</div>
</template>

<script>
export default {
	name: "SoftwareIdentityReview",
	props: {
		candecide: { type: Boolean, default: false },
		cansearch: { type: Boolean, default: false },
	},
	emits: ["decided"],
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,

			rows: [],
			total: 0,
			currentPage: 1,
			perPage: 20,

			productOptions: [],
			searchTimer: null,
		}
	},
	watch: {
		async currentPage() {
			await this.load()
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
				const data = await this.$api.generic.get("software_identities/review/", {
					limit: this.perPage,
					offset: (this.currentPage - 1) * this.perPage,
				})
				this.rows = data.results || data
				this.total = typeof data.count === "number" ? data.count : this.rows.length
				this.errored = false
				if (!this.rows.length && this.currentPage > 1) {
					this.currentPage -= 1
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
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
				await this.load()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},
	},
}
</script>
