<template>
	<b-modal
		:model-value="modelValue"
		:title="title"
		hide-footer
		modal-class="custom-modal"
		@update:model-value="$emit('update:modelValue', $event)"
		@show="reset"
	>
		<template #header="{ close }">
			<h5 class="modal-title">
				{{ title }}
				<b-spinner
					v-if="saving"
					small
					variant="success"
				/>
			</h5>
			<b-button
				size="sm"
				variant="outline-danger"
				@click="close()"
			>
				<font-awesome-icon :icon="['fas', 'xmark']" />
			</b-button>
		</template>

		<div
			v-if="errormsg"
			class="alert alert-danger"
			role="alert"
		>
			{{ errormsg }}
		</div>

		<b-form @submit.prevent="onSubmit">
			<b-form-group
				:label="$t('security.exclusion_target')"
				class="mb-3"
			>
				<b-form-radio-group
					v-model="target"
					:options="targetOptions"
				/>
			</b-form-group>

			<b-form-group
				v-if="target === 'asset'"
				:label="$t('security.machine')"
				class="mb-3"
			>
				<AssetPicker
					v-model="row.asset"
					v-model:name="assetName"
					required
				/>
			</b-form-group>
			<b-form-group
				v-else
				:label="$t('security.group')"
				class="mb-3"
			>
				<v-select
					v-model="row.group"
					:options="groups"
					:reduce="option => option.value"
					label="text"
				>
					<template #search="{ attributes, events }">
						<input
							class="vs__search"
							:required="!row.group"
							v-bind="attributes"
							v-on="events"
						>
					</template>
				</v-select>
			</b-form-group>

			<b-form-group
				:label="$t('security.exclusion_vuln')"
				label-for="exclusion-vuln"
				class="mb-3"
			>
				<b-form-input
					id="exclusion-vuln"
					v-model.trim="row.vuln_id"
					:placeholder="$t('security.whole_scan')"
				/>
			</b-form-group>

			<b-form-group
				:label="$t('security.exclusion_comment')"
				label-for="exclusion-comment"
				class="mb-3"
			>
				<b-form-textarea
					id="exclusion-comment"
					v-model="row.comment"
					rows="3"
					required
				/>
			</b-form-group>

			<b-form-group
				:label="$t('security.exclusion_expires')"
				label-for="exclusion-expires"
				class="mb-3"
			>
				<b-form-input
					id="exclusion-expires"
					v-model="expiresAt"
					type="datetime-local"
					:min="minExpiry"
				/>
			</b-form-group>

			<div class="text-center">
				<b-button
					type="submit"
					variant="success"
					:disabled="saving"
				>
					{{ exclusion ? $t('generic.save') : $t('generic.add') }}
				</b-button>
			</div>
		</b-form>
	</b-modal>
</template>

<script>
import { apiErrorMessage, asList } from "@/utils/security"

// datetime-local wants the local time, without seconds nor zone
function toLocalInput(value) {
	if (!value) return ""
	const date = new Date(value)
	const pad = (number) => String(number).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default {
	name: "ExclusionModal",
	props: {
		modelValue: { type: Boolean, default: false },
		// exclusion to edit, null to create one
		exclusion: { type: Object, default: null },
		// values of a new exclusion: {vuln_id, asset, asset_name, group}
		preset: { type: Object, default: () => ({}) },
	},
	emits: ["update:modelValue", "saved"],
	data() {
		return {
			row: { vuln_id: "", asset: null, group: null, comment: "" },
			target: "asset",
			assetName: "",
			expiresAt: "",
			groups: [],
			saving: false,
			errormsg: null,
		}
	},
	computed: {
		title() {
			return this.exclusion ? this.$t("security.edit_exclusion") : this.$t("security.add_exclusion")
		},
		targetOptions() {
			return [
				{ value: "asset", text: this.$t("security.machine") },
				{ value: "group", text: this.$t("security.group") },
			]
		},
		minExpiry() {
			return toLocalInput(new Date())
		},
	},
	methods: {
		async reset() {
			const source = this.exclusion || this.preset || {}
			this.row = {
				vuln_id: source.vuln_id || "",
				asset: source.asset || null,
				group: source.group || null,
				comment: source.comment || "",
			}
			this.assetName = source.asset_name || ""
			this.target = this.row.group ? "group" : "asset"
			this.expiresAt = toLocalInput(source.expires_at)
			this.errormsg = null
			if (!this.groups.length) {
				await this.loadGroups()
			}
		},

		async loadGroups() {
			try {
				const data = await this.$api.generic.get("asset/groups/")
				this.groups = asList(data)
					.map((group) => ({
						value: group.id,
						text: group.is_dynamic ? `${group.name} (${this.$t("security.dynamic_group")})` : group.name,
					}))
					.sort((a, b) => a.text.localeCompare(b.text))
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
			}
		},

		async onSubmit() {
			this.errormsg = null
			if (!this.row.comment.trim()) {
				this.errormsg = this.$t("security.exclusion_comment_required")
				return
			}
			if (this.expiresAt && new Date(this.expiresAt) <= new Date()) {
				this.errormsg = this.$t("security.exclusion_expires_past")
				return
			}
			// Exactly one target is accepted
			const payload = {
				vuln_id: this.row.vuln_id,
				asset: this.target === "asset" ? this.row.asset : null,
				group: this.target === "group" ? this.row.group : null,
				comment: this.row.comment.trim(),
				expires_at: this.expiresAt ? new Date(this.expiresAt).toISOString() : null,
			}
			this.saving = true
			try {
				if (this.exclusion) {
					await this.$api.generic.patch(`vulnerability_exclusions/${this.exclusion.id}/`, payload)
				} else {
					await this.$api.generic.post("vulnerability_exclusions/", payload)
				}
				this.$emit("saved")
				this.$emit("update:modelValue", false)
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
			} finally {
				this.saving = false
			}
		},
	},
}
</script>
