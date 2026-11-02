<template>
	<div
		id="security-settings"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="security_settings" />

			<div class="page-body">
				<div v-if="denied">
					<Alert
						:message="$t('message.dont_have_right_to_see')"
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
				<div
					v-else
					class="card"
				>
					<div class="card-body">
						<div
							v-if="errormsg"
							class="alert alert-danger"
							role="alert"
						>
							{{ errormsg }}
						</div>
						<Alert
							v-if="saved"
							:message="$t('security.settings_saved')"
							:cols="true"
							variant="success"
						/>

						<b-form
							v-if="settings"
							@submit.prevent="save"
						>
							<h3>{{ $t('security.settings_nvd') }}</h3>
							<b-form-group
								:label="$t('security.nvd_years')"
								:description="$t('security.nvd_years_help')"
								label-for="nvd-years"
								class="mb-4"
							>
								<b-form-input
									id="nvd-years"
									v-model.number="form.nvd_years"
									type="number"
									min="1"
									max="25"
									step="1"
									required
									:disabled="!canedit"
									class="settings-number"
								/>
							</b-form-group>

							<h3>{{ $t('security.settings_priority') }}</h3>
							<p class="text-muted">
								{{ $t('security.priority_help') }}
							</p>
							<div class="mb-4">
								<PriorityOrder
									v-model="form.priority"
									:disabled="!canedit"
								/>
							</div>

							<h3>{{ $t('security.settings_cpe') }}</h3>
							<p class="text-muted">
								{{ $t('security.cpe_scores_help') }}
							</p>
							<b-row class="mb-2">
								<b-col md="4">
									<b-form-group
										:label="$t('security.cpe_match_score')"
										label-for="cpe-match"
									>
										<b-form-input
											id="cpe-match"
											v-model.number="form.cpe_match_score"
											type="number"
											min="0"
											max="1"
											step="0.01"
											required
											:disabled="!canedit"
										/>
									</b-form-group>
								</b-col>
								<b-col md="4">
									<b-form-group
										:label="$t('security.cpe_review_score')"
										label-for="cpe-review"
									>
										<b-form-input
											id="cpe-review"
											v-model.number="form.cpe_review_score"
											type="number"
											min="0"
											max="1"
											step="0.01"
											required
											:disabled="!canedit"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<div
								v-if="scoresInvalid"
								class="alert alert-danger"
								role="alert"
							>
								{{ $t('security.cpe_scores_invalid') }}
							</div>
							<Alert
								v-else-if="scoresChanged"
								:message="$t('security.cpe_scores_warning')"
								variant="warning"
							/>

							<div class="d-flex align-items-center mt-4">
								<span
									v-if="settings.updated_at"
									class="text-muted"
								>
									{{ $t('security.updated_at', { date: formatDateTime(settings.updated_at) }) }}
								</span>
								<b-button
									v-if="canedit"
									type="submit"
									variant="success"
									class="ms-auto"
									:disabled="saving || !changed || scoresInvalid"
								>
									<b-spinner
										v-if="saving"
										small
										class="me-1"
									/>
									{{ $t('generic.save') }}
								</b-button>
							</div>
						</b-form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import { apiErrorMessage, asList, formatDateTime } from "@/utils/security"

const FIELDS = ["nvd_years", "priority", "cpe_match_score", "cpe_review_score"]

export default {
	name: "SecuritySettings",
	data() {
		return {
			denied: false,
			loading: true,
			saving: false,
			saved: false,
			errormsg: null,
			canedit: false,
			settings: null,
			form: {},
		}
	},
	computed: {
		changedFields() {
			if (!this.settings) return []
			return FIELDS.filter((field) => JSON.stringify(this.form[field]) !== JSON.stringify(this.settings[field]))
		},
		changed() {
			return this.changedFields.length > 0
		},
		scoresChanged() {
			return this.changedFields.includes("cpe_match_score") || this.changedFields.includes("cpe_review_score")
		},
		scoresInvalid() {
			const match = this.form.cpe_match_score
			const review = this.form.cpe_review_score
			return !(typeof match === "number" && typeof review === "number" && review < match && match <= 1)
		},
	},
	async mounted() {
		if (!hasPermission("security_view_securitysettings")) {
			this.denied = true
			return
		}
		this.canedit = hasPermission("security_change_securitysettings")
		try {
			const data = await this.$api.generic.get("security_settings/")
			// a single object, or a list holding it
			this.setSettings(Array.isArray(data) || data?.results ? asList(data)[0] : data)
		} catch (e) {
			this.errormsg = apiErrorMessage(e)
		} finally {
			this.loading = false
		}
	},
	methods: {
		formatDateTime,

		setSettings(settings) {
			this.settings = settings
			this.form = {
				nvd_years: settings.nvd_years,
				priority: [...(settings.priority || [])],
				cpe_match_score: settings.cpe_match_score,
				cpe_review_score: settings.cpe_review_score,
			}
		},

		async save() {
			this.errormsg = null
			this.saved = false
			if (this.form.nvd_years < 1 || this.form.nvd_years > 25) {
				this.errormsg = this.$t("security.nvd_years_invalid")
				return
			}
			const payload = Object.fromEntries(this.changedFields.map((field) => [field, this.form[field]]))
			this.saving = true
			try {
				this.setSettings(await this.$api.generic.patch(`security_settings/${this.settings.id}/`, payload))
				this.saved = true
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
			} finally {
				this.saving = false
			}
		},
	},
}
</script>

<style scoped>
.settings-number {
	max-width: 8rem;
}
</style>
