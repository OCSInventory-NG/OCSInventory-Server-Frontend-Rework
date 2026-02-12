<template>
	<div
		id="ipdiscover-config"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="ipdiscover" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<section v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</section>

						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')"
								:cols="true"
								variant="success"
							/>
						</section>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<b-form
							v-else
							@submit="onSubmit"
						>
							<b-list-group 
								v-for="parameter in configs.value"
								:key="parameter.name"
								flush
							>
								<div v-if="parameter.length">
									<div
										v-for="subparameter in parameter"
										:key="subparameter.name"
									>
										<b-list-group-item 
											class="d-flex justify-content-between align-items-center"
										>
											<div>
												<h4 class="mb-1">
													{{ $t("configuration."+subparameter.name) }}
												</h4>
												<p class="mb-1">
													{{ $t("configuration."+subparameter.description) }}
												</p>
											</div>
											<div 
												v-if="subparameter.type == 'switch'"
											>
												<label class="form-check form-switch">
													<input 
														:id="subparameter.name"
														v-model="subparameter.value"
														class="form-check-input"
														type="checkbox"
														:disabled="!canedit"
													>
												</label>
											</div>
											<div 
												v-if="subparameter.type in inputtype"
												class="ocs-config-form"
											>
												<b-input-group>
													<template 
														v-if="subparameter.unit != ''"
														#append
													>
														<b-input-group-text class="form-control">
															{{ $t("configuration."+subparameter.unit) }}
														</b-input-group-text>
													</template>
													<b-form-input
														:id="subparameter.name"
														v-model="subparameter.value"
														:type="inputtype[subparameter.type]"
														:disabled="!canedit"
													/>
												</b-input-group>
											</div>
											<div 
												v-if="subparameter.type == 'select'"
												class="ocs-config-form"
											>
												<b-form-select 
													v-model="subparameter.value" 
													class="form-select mb-3"
												>
													<b-form-select-option 
														v-for="option in subparameter.options"
														:key="option"
														:value="option"
													>
														{{ $t("configuration."+option) }}
													</b-form-select-option>
												</b-form-select>
											</div>
										</b-list-group-item>
									</div>
								</div>
								<b-list-group-item 
									v-else
									class="d-flex justify-content-between align-items-center"
								>
									<div>
										<h4 class="mb-1">
											{{ $t("configuration."+parameter.name) }}
										</h4>
										<p class="mb-1">
											{{ $t("configuration."+parameter.description) }}
										</p>
									</div>
									<div 
										v-if="parameter.type == 'switch'"
									>
										<label class="form-check form-switch">
											<input 
												:id="parameter.name"
												v-model="parameter.value"
												class="form-check-input"
												type="checkbox"
												:disabled="!canedit"
											>
										</label>
									</div>
									<div 
										v-if="parameter.type in inputtype"
										class="ocs-config-form"
									>
										<b-input-group>
											<template 
												v-if="parameter.unit != ''"
												#append
											>
												<b-input-group-text class="form-control">
													{{ $t("configuration."+parameter.unit) }}
												</b-input-group-text>
											</template>
											<b-form-input
												:id="parameter.name"
												v-model="parameter.value"
												:type="inputtype[parameter.type]"
												:disabled="!canedit"
											/>
										</b-input-group>
									</div>
									<div 
										v-if="parameter.type == 'select'"
										class="ocs-config-form"
									>
										<b-form-select 
											v-model="parameter.value" 
											class="form-select mb-3"
										>
											<b-form-select-option 
												v-for="option in parameter.options"
												:key="option"
												:value="option"
											>
												{{ $te("configuration."+option) ?
													$t("configuration."+option) : option }}
											</b-form-select-option>
										</b-form-select>
									</div>
								</b-list-group-item>
							</b-list-group>
							<b-row>
								<b-col align-self="start" />
								<b-col 
									align-self="center"
									align="center"
									class="multisearch-btns"
								>
									<b-button 
										type="submit"
										variant="success"
									>
										{{ $t('generic.save') }}
									</b-button>
								</b-col>
								<b-col align-self="end" />
							</b-row>
						</b-form>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "IpdiscoverConfig",
	data() {
		return {
			errormsg: null,
			errored: false,

			successmsg: null,
			successed: false,

			canedit: false,

			configs: [],

			allconfigview: false,
			inputtype: {
				"number input": "number",
				"text input": "text"
			},

			loading: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.successed = false
				this.successmsg = null
			}, 5000)
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("config_view_config")) {
			if (permissions.includes("config_change_config")) {
				this.canedit = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			return
		}

		// Data init
		await this.getIpdConfig()
	},
	methods: {
		async getIpdConfig() {
			this.loading = true
			this.configs = []

			try {
				const data = await this.$api.generic.get("config/ipdiscover/")
				this.configs = data

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()

			try {
				this.loading = true

				const payload = {
					...this.configs,
					value: Array.isArray(this.configs?.value)
						? this.configs.value.map((item) => {
								if (item?.type === "number input") {
									const n = parseInt(item.value, 10)
									return { ...item, value: Number.isNaN(n) ? item.value : n }
								}
								return item
						})
						: this.configs?.value,
				}

				await this.$api.generic.patch("config/ipdiscover/", payload)

				this.configs = payload

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
				this.successmsg = null
				this.successed = false
			} finally {
				this.loading = false
			}
		},
	}
}
</script>