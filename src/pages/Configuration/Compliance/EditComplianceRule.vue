<template lang="">
	<div
		id="edit-compliance-rule"
		class="container-xl"
	>
		<PageHeader page-title="rules" />

		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<section v-if="successed">
						<Alert
							:message="$t('message.success_saved')"
							:cols="true"
							variant="success"
						/>
					</section>

					<section v-if="errored && errorCode == null">
						<Alert
							:message="errormsg.message"
							:cols="true"
							variant="danger"
						/>
					</section>

					<section v-else>
						<div
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<div v-if="errored && errorCode != null">
								<Alert
									:message="errormsg"
									:cols="true"
									variant="danger"
								/>
							</div>

							<b-row class="text-center">
								<h2>{{ rule.name }}</h2>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>{{ $t('compliance.type') }} : {{ translatedLabel('compliance.type_', rule.type) }}</p>
									<p>
										{{ $t('compliance.severity') }} :
										{{ translatedLabel('compliance.severity_', rule.severity) }}
									</p>
									<p>{{ $t('compliance.enabled') }} : {{ $t("generic." + rule.enabled) }}</p>
								</b-col>
							</b-row>

							<RuleCriteria
								:id="id"
								:logic="logic"
								:view-only="viewOnly"
								:context-fields-path="'compliance/rules/context-fields/'"
								:supports-inventory-fields="true"
								:can-remove-condition="false"
								:save-api-path="`compliance/rules/${id}/`"
								@reload-rule="reloadRule"
							/>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "EditComplianceRule",
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errored: false,
			errormsg: null,
			errorCode: null,

			successed: false,
			successmsg: null,

			logic: {},
			rule: {},

			loading: true,
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem('permissions')?.split(',').includes('compliance_change_compliancerule')
		}
	},
	watch: {
		successed: function() {
			setTimeout(
				() => this.successed = false, 5000
			)
		}
	},
	async mounted() {
		await this.getRuleInfo()
	},
	methods: {
		async getRuleInfo() {
			try {
				const data = await this.$api.generic.get(`compliance/rules/${this.id}/`)

				this.rule = data
				this.logic = data?.logic

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : (e.message || String(e))
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		translatedLabel(prefix, value) {
			const key = prefix + value
			return this.$te(key) ? this.$t(key) : value
		},

		async reloadRule() {
			await this.getRuleInfo()
		}
	}
}
</script>
