<template>
	<b-modal
		:model-value="modelValue"
		:title="$t('software_identity.decide_title')"
		size="lg"
		:ok-title="$t('software_identity.decide_ok')"
		:cancel-title="$t('generic.cancel')"
		:ok-disabled="!canValidate || saving"
		@update:model-value="$emit('update:modelValue', $event)"
		@show="reset"
		@ok.prevent="validate"
	>
		<template v-if="software">
			<!-- the software being identified -->
			<div class="mb-3">
				<h3 class="mb-1">
					{{ software.name }}
				</h3>
				<div class="text-muted">
					{{ $t('software_identity.family_' + software.family) }}
					· {{ $t('software_identity.decide_versions', { count: software.entries }, software.entries) }}
					· {{ $t('software_identity.decide_machines', { count: software.machines }, software.machines) }}
				</div>
				<div
					v-if="software.product"
					class="mt-1"
				>
					{{ $t('software_identity.decide_current') }} :
					<strong>{{ cpeLabel(software.product) }}</strong>
				</div>
			</div>

			<div
				v-if="errormsg"
				class="alert alert-danger"
				role="alert"
			>
				{{ errormsg }}
			</div>

			<div class="form-selectgroup form-selectgroup-boxes d-flex flex-column gap-2">
				<label
					v-for="candidate in software.candidates"
					:key="candidate.product"
					class="form-selectgroup-item"
				>
					<input
						v-model="choice"
						type="radio"
						class="form-selectgroup-input"
						:value="'candidate:' + candidate.product"
					>
					<span class="form-selectgroup-label d-flex align-items-center gap-3 p-3">
						<span class="form-selectgroup-check" />
						<span class="flex-fill text-start">{{ cpeLabel(candidate.product) }}</span>
						<span
							class="badge bg-blue-lt"
							:title="$t('software_identity.score')"
						>{{ candidate.score.toFixed(2) }}</span>
					</span>
				</label>

				<label
					v-if="cansearch"
					class="form-selectgroup-item"
				>
					<input
						v-model="choice"
						type="radio"
						class="form-selectgroup-input"
						value="other"
					>
					<span class="form-selectgroup-label d-flex align-items-center gap-3 p-3">
						<span class="form-selectgroup-check" />
						<span class="text-start text-nowrap">{{ $t('software_identity.other_product') }}</span>
						<v-select
							v-model="otherProduct"
							:options="productOptions"
							:filterable="false"
							:reduce="option => option.value"
							:placeholder="$t('software_identity.type_to_search')"
							class="flex-fill identity-product-search"
							@search="searchProducts"
							@open="choice = 'other'"
						>
							<template #no-options>
								{{ $t('software_identity.type_to_search') }}
							</template>
						</v-select>
					</span>
				</label>

				<label class="form-selectgroup-item">
					<input
						v-model="choice"
						type="radio"
						class="form-selectgroup-input"
						value="none"
					>
					<span class="form-selectgroup-label d-flex align-items-center gap-3 p-3">
						<span class="form-selectgroup-check" />
						<span class="text-start">{{ $t('software_identity.no_cpe') }}</span>
					</span>
				</label>
			</div>
		</template>
	</b-modal>
</template>

<script>
import { cpeLabel } from "@/utils/security"

// Choice of the product of one software: a candidate, another product of the
// CPE index, or no CPE at all
export default {
	name: "IdentityDecisionModal",
	props: {
		modelValue: { type: Boolean, default: false },
		// row of the review: name, family, match_key, entries, machines, product, candidates
		software: { type: Object, default: null },
		cansearch: { type: Boolean, default: false },
	},
	emits: ["update:modelValue", "decided"],
	data() {
		return {
			choice: null,
			otherProduct: null,
			productOptions: [],
			searchTimer: null,
			saving: false,
			errormsg: null,
		}
	},
	computed: {
		// candidate:<key>, other or none
		product() {
			if (this.choice === "none") return null
			if (this.choice === "other") return this.otherProduct
			return this.choice ? this.choice.slice("candidate:".length) : undefined
		},
		canValidate() {
			if (this.choice === "none") return true
			return !!this.product
		},
	},
	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},
	methods: {
		cpeLabel,

		// the current product, else the best candidate, is picked first
		reset() {
			const candidates = this.software?.candidates || []
			const current = candidates.find((candidate) => candidate.product === this.software?.product)
			const first = current || candidates[0]
			this.choice = first ? "candidate:" + first.product : null
			this.otherProduct = null
			this.productOptions = []
			this.errormsg = null
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
						label: cpeLabel(product.key),
						value: product.key,
					}))
				} catch {
					this.productOptions = []
				} finally {
					toggleLoading(false)
				}
			}, 300)
		},

		async validate() {
			if (!this.canValidate) return
			this.saving = true
			this.errormsg = null
			try {
				await this.$api.generic.post("software_identity_decisions/", {
					family: this.software.family,
					match_key: this.software.match_key,
					product: this.product,
				})
				this.$emit("decided")
				this.$emit("update:modelValue", false)
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.response?.data?.detail || e?.message || String(e)
			} finally {
				this.saving = false
			}
		},
	},
}
</script>
