<template>
	<div
		id="general" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="config"
			/>

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display success box message -->
						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')" 
								variant="success"
							/>
						</section>

						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg" 
								variant="danger"
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
							<b-tabs 
								v-model="activetab"
								content-class="mt-3"
								fill
							>
								<b-tab
									v-for="config in configs"
									:key="config.name"
									:title="$t('configuration.' + config.name)"
								>
									<b-list-group 
										v-for="parameter in config.value"
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
															<b-form-select-option value="">
																{{ $t("configuration.none") }}
															</b-form-select-option>
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
													<b-form-select-option value="">
														{{ $t("configuration.none") }}
													</b-form-select-option>
													<b-form-select-option 
														v-for="option in parameter.options"
														:key="option"
														:value="option"
													>
														{{ $t("configuration."+option) }}
													</b-form-select-option>
												</b-form-select>
											</div>
										</b-list-group-item>
									</b-list-group>
								</b-tab>
							</b-tabs>
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
import axios from 'axios'

export default {
	name: 'General',
	data() {
		return {
			configs: [],
			errormsg: null,
			successmsg: null,
			errored: false,
			successed: false,
			loading: true,
			canedit: false,
			canview: false,
			activetab: 0,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			inputtype: {
				"number input": "number",
				"text input": "text"
			}
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		},
		errored: function() {
			setTimeout(() => this.errored = false, 5000)
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("config_view_config")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("config_change_config")) {
				this.canedit = true
			}
			await this.getConfig()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}	
	},
	methods: {
		// Get all config
		async getConfig() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"config", { headers: this.header })
				.then(response => {
					for(const config of response.data) {
						if(config.name != "snmp") {
							this.configs.push(config)
						}
					}
					this.loading = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
					this.loading = false
				})
		},
		onSubmit(event) {
			event.preventDefault()

			var configToUpdate = this.configs[this.activetab].name

			axios.patch(this.$config.BACKEND_API_ROUTE+"config/"+configToUpdate+"/", this.configs[this.activetab],
				{ headers: this.header })
				.then(() => {
					this.successmsg = "success"
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
					this.successmsg = null
					this.successed = false
				})
		}
	}
}
</script>