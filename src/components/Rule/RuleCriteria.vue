<template lang="">
	<div id="rule-criteria">
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
			<div
				v-for="(masterinput, masterindex) in datavalues"
				:key="masterindex"
			>
				<b-row
					v-show="datavalues.length > 1"
					align="right"
				>
					<b-col align-self="start" />
					<b-col 
						v-if="masterindex > 0"
						align="center"
					>
						<span 
							class="badge bg-blue ocs-span"
						>
							{{ $t("search.or") }}
						</span>
					</b-col>
					<b-col align-self="end" />
				</b-row>
				<div
					class="modal-allactions multisearch-card"
				>
					<b-row
						v-show="datavalues.length > 1"
						align="right"
					>
						<b-col align-self="start" />
						<b-col align-self="end">
							<b-button 
								size="sm"
								variant="outline-danger"
								:title="$t('rule.removeorcondition')"
								@click="removeOrCondition(masterindex, datavalues)"
							>
								<font-awesome-icon 
									:icon="['fas', 'xmark']"
									size="1x"
								/>
							</b-button>
						</b-col>
					</b-row>
					
					<div
						v-for="(input, index) in masterinput"
						:key="`valueInput-${index}`"
						class="modal-allactions"
					>
						<b-row>
							<b-col
								v-if="index > 0"
								cols="1"
							>
								<b-form-group>
									<span 
										class="badge bg-blue form-control ocs-span"
									>
										{{ $t("search.and") }}
									</span>
								</b-form-group>
							</b-col>
							<b-col>
								<b-form-group>
									<v-select
										id="field"
										v-model="input.field"
										:options="fields"
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:loading="(loadingfield) ? true : false"
										:selectable="option => {
											if (option.value !== 'auth_profile.auth_config') return true
											return index > 0
										}"
										@update:modelValue="val => {
											input.value = null
											onFieldChange(input, masterindex, input.value)
										}"
									/>
									<b-form-input
										v-if="input.field && input.field.includes('metadata')"
										v-model="input.metadata_field"
										placeholder="Metadata field"
										class="mb-3"
									/>
								</b-form-group>
							</b-col>
							<b-col cols="3">
								<b-form-group>
									<v-select
										id="operator"
										v-model="input.operator"
										:disabled="input.field == 'auth_profile.auth_method' 
											|| isAuthConfigRow(masterindex, input)"
										:options="operators" 
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										required
									/>
								</b-form-group>
								<b-form-checkbox
									v-if="input.field !== 'auth_profile.auth_method' 
										&& !isAuthConfigRow(masterindex, input)
										&& (input.operator == 'in'
											|| input.operator == '=='
											|| input.operator == '!=')"
									id="case_sensitive"
									v-model="input.case_sensitive"
									name="enabled"
									:value="true"
									inline
								>
									{{ $t("rule.case_sensitive") }}
								</b-form-checkbox>
							</b-col>
							<b-col cols="3">
								<b-form-group>
									<v-select
										v-if="input.field === 'auth_profile.auth_method'"
										v-model="input.value"
										:options="authMethods"
										:reduce="opt => opt.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										@update:modelValue="val => onFieldChange(input, masterindex, val)"
									/>
									<v-select
										v-else-if="input.field === 'auth_profile.auth_config'"
										v-model="input.value"
										:options="authConfigs.filter(config => {
											const inputMethod = masterinput
												.filter(c => c.field === 'auth_profile.auth_method' && c.value)
												.map(c => c.value)
											return inputMethod.includes(config.method)
										})"
										:reduce="opt => opt.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
									/>
									<b-form-input
										v-else
										id="value"
										v-model="input.value"
										class="mb-3"
										:disabled="(disabledvalue.includes(input.operator)) ? true : false"
									/>
								</b-form-group>
							</b-col>
							<b-col cols="1">
								<b-form-group>
									<b-button 
										v-if="!isAuthConfigRow(masterindex, input)"
										:id="'addfield'+masterindex+index"
										v-b-modal="1"
										variant="primary"
										class="d-none d-sm-inline-block form-control"
										:title="$t('rule.addandcondition')"
										@click="addAndCondition(masterindex, index, datavalues)"
									>
										<font-awesome-icon 
											:icon="['fas', 'plus']"
										/>
									</b-button>
								</b-form-group>
							</b-col>
							<b-col 
								v-show="datavalues[masterindex].filter(input => input.field !== 'auth_profile.auth_config').length > 1"
								cols="1"
							>
								<b-form-group>
									<b-button 
										v-if="!isAuthConfigRow(masterindex, input)"
										:id="'removefield'+masterindex+index"
										v-b-modal="1"
										variant="danger"
										class="d-none d-sm-inline-block form-control"
										:title="$t('rule.removeandcondition')"
										@click="if (input.field === 'auth_profile.auth_method') removeAuthConfig(masterindex);
										removeAndCondition(masterindex, index, datavalues)"
									>
										<font-awesome-icon 
											:icon="['fas', 'trash-can']"
										/>
									</b-button>
								</b-form-group>
							</b-col>
						</b-row>
					</div>
				</div>
			</div>
			<b-row>
				<b-col align-self="start" />
				<b-col 
					align-self="center"
					align="center"
					class="multisearch-btns"
				>
					<b-button 
						type="button"
						variant="info"
						class="multisearch-btn"
						@click="addOrCondition(datavalues)"
					>
						{{ $t('rule.addorcondition') }}
					</b-button>
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
</template>

<script>

export default {
	name: "RuleCriteria",
	props: {
		id: { type: String, required: true },
		trigger: { type: String, default: "inventory_received" },
		logic: { type: Object, default: null }
	},
	data() {
		return {
			errormsg: null,
			errorCode: null,
			errored: false,

			successed: false,
			successmsg: null,

			logicupdate: {
				logic: {}
			},
			fields: [],
			operators: [
				{ value: "==", text: this.$t("rule.equal") },
				{ value: "!=", text: this.$t("rule.notequal") },
				{ value: ">", text: this.$t("rule.morethan") },
				{ value: ">=", text: this.$t("rule.morethanorequal") },
				{ value: "<", text: this.$t("rule.lessthan") },
				{ value: "<=", text: this.$t("rule.lessthanorequal") },
				{ value: "!!", text: this.$t("rule.boolean") },
				{ value: "!", text: this.$t("rule.not") },
				{ value: "in", text: this.$t("rule.contains") },
				{ value: "regex", text: this.$t("rule.regex") }
			],
			triggermodel: {
				"inventory_received": {
					route: "asset/bases/",
					key: "inventory."
				},
				"user_login": {
					route: "users/",
					key: "user."
				},
				"netdevice_received": {
					route: "netdevices/",
					key: "network."
				}
			},
			auth_methods: [],
			authConfigs: [],

			operatortargets: {
				"==": this.$t("rule.equal"),
				"!=": this.$t("rule.notequal"),
				">": this.$t("rule.morethan"),
				">=": this.$t("rule.morethanorequal"),
				"<": this.$t("rule.lessthan"),
				"<=": this.$t("rule.lessthanorequal"),
				"!!": this.$t("rule.boolean"),
				"!": this.$t("rule.not"),
				"in": this.$t("rule.contains"),
				"regex": this.$t("rule.regex")
			},
			datavalues: [
				[
					{
						field: "id",
						operator: "==",
						value: null,
						case_sensitive: false,
						metadata_field: null
					}
				]
			],
			links: [ "and", "or" ],
			disabledvalue: ["!!", "!"],

			loading: true,
			loadingfield: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.successed = false
				this.$emit("reloadRule")
			}, 5000)
		}
	},
	async mounted() {
		await this.getAuthMethods()
		await this.getAuthConfigs()
		await this.getLogicRow()
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async getModelField() {
			this.loadingfield = true

			try {
				const route = this.triggermodel[this.trigger].route
				const key = this.triggermodel[this.trigger].key

				const data = await this.$api.generic.options(route)

				this.fields = []

				Object.keys(data.actions.POST).forEach((field) => {
					if (!["inventory_sections", "matched"].includes(field)) {
						this.fields.push({
							value: field,
							text: this.$t(key + field),
						})
					}
				})
				const triggers = await this.$api.generic.get("automation/triggers/")
				const triggerObj = triggers.find(t => t.trigger === this.trigger)

				if (triggerObj?.context_fields) {
					Object.keys(triggerObj.context_fields).forEach(parent => {
						Object.keys(triggerObj.context_fields[parent]).forEach(child => {
							const fullPath = `${parent}.${child}`

							if (!this.fields.find(f => f.value === fullPath)) {
								this.fields.push({
									value: fullPath,
									text: this.$t(`trigger_fields.${fullPath}`, fullPath)
								})
							}
						})
					})	
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loadingfield = false
				this.loading = false
			}
		},

		async getLogicRow() {
			if (this.logic && Object.keys(this.logic).length > 0) {
				this.datavalues = []
			}

			let masterindex = 0

			Object.keys(this.logic || {}).forEach((key) => {
				if (!this.links.includes(key)) {
					if (key !== "case_sensitive") {
						let fullVar = this.logic[key][0].var ?? this.logic[key][1].var
						let metadata_field = null

						if (fullVar && fullVar.includes(".metadata.")) {
							metadata_field = fullVar.split(".metadata.")[1]
							fullVar = fullVar.split(".metadata.")[0] + ".metadata"
						}
						this.datavalues = [
							[
								{
									field: fullVar,
									metadata_field,
									operator: key,
									value: (this.logic[key][1] && this.logic[key][1].var)
										? this.logic[key][0]
										: (this.logic[key][1] ? this.logic[key][1] : null),
								},
							],
						]
					} else {
						this.datavalues[0][0].case_sensitive = this.logic[key]
					}
				} else if (key === "and") {
					this.datavalues[masterindex] = []

					Object.keys(this.logic[key]).forEach((and) => {
						Object.keys(this.logic[key][and]).forEach((operator) => {
							if (operator !== "case_sensitive") {
								this.datavalues[masterindex].push({
									field: this.logic[key][and][operator][0].var
										?? this.logic[key][and][operator][1].var,
									operator: operator,
									value: (this.logic[key][and][operator][1] && this.logic[key][and][operator][1].var)
										? this.logic[key][and][operator][0]
										: (this.logic[key][and][operator][1]
											? this.logic[key][and][operator][1]
											: null),
								})
							} else {
								this.datavalues[masterindex][this.datavalues[masterindex].length - 1].case_sensitive =
									this.logic[key][and][operator]
							}
						})
					})
				} else if (key === "or") {
					Object.keys(this.logic[key]).forEach((or) => {
						this.datavalues[masterindex] = []

						Object.keys(this.logic[key][or]).forEach((key2) => {
							if (key2 === "and") {
								Object.keys(this.logic[key][or][key2]).forEach((and) => {
									Object.keys(this.logic[key][or][key2][and]).forEach((operator) => {
										if (operator !== "case_sensitive") {
											this.datavalues[masterindex].push({
												field: this.logic[key][or][key2][and][operator][0].var
													?? this.logic[key][or][key2][and][operator][1].var,
												operator: operator,
												value: (this.logic[key][or][key2][and][operator][1]
													&& this.logic[key][or][key2][and][operator][1].var)
													? this.logic[key][or][key2][and][operator][0]
													: (this.logic[key][or][key2][and][operator][1]
														? this.logic[key][or][key2][and][operator][1]
														: null),
											})
										} else {
											this.datavalues[masterindex][
												this.datavalues[masterindex].length - 1
											].case_sensitive =
												this.logic[key][or][key2][and][operator]
										}
									})
								})
							} else {
								if (key2 !== "case_sensitive") {
									this.datavalues[masterindex].push({
										field: this.logic[key][or][key2][0].var
											?? this.logic[key][or][key2][1].var,
										operator: key2,
										value: (this.logic[key][or][key2][1] && this.logic[key][or][key2][1].var)
											? this.logic[key][or][key2][0]
											: (this.logic[key][or][key2][1]
												? this.logic[key][or][key2][1]
												: null),
									})
									masterindex++
								} else {
									this.datavalues[masterindex - 1][
										this.datavalues[masterindex - 1].length - 1
									].case_sensitive =
										this.logic[key][or][key2]
								}
							}
						})
					})
				}
			})
			this.datavalues.forEach(masterInput => {
				masterInput.forEach(input => {
					if (input.field.includes(".metadata.") && input.metadata_field == null) {
						input.metadata_field = input.field.split(".metadata.")[1]
						input.field = input.field.split(".metadata.")[0] + ".metadata"
					}
				})
			})
			this.datavalues = JSON.parse(JSON.stringify(this.datavalues))

			await this.getModelField()
		},

		addAndCondition(masterindex, index, fieldType) {
			fieldType[masterindex].push({
				field: "id",
				operator: "==",
				value: null,
				case_sensitive: false,
				metadata_field: null
			})
		},

		removeAndCondition(masterindex, index, fieldType) {
			fieldType[masterindex].splice(index, 1)
		},

		addOrCondition(fieldType) {
			const masterindex = fieldType.length
			fieldType[masterindex] = []

			fieldType[masterindex].push({
				field: "id",
				operator: "==",
				value: null,
				case_sensitive: false,
				metadata_field: null
			})

			this.datavalues = JSON.parse(JSON.stringify(fieldType))
		},

		removeOrCondition(masterindex, fieldType) {
			fieldType.splice(masterindex, 1)
		},

		pushInLogicComplexe(object, key, logics) {
			let fieldVar = logics[key].field
			if (logics[key].metadata_field && logics[key].field.includes("metadata")) {
				fieldVar = `${logics[key].field}.${logics[key].metadata_field}`
			}
			if (this.disabledvalue.includes(logics[key].operator)) {
				object.push({
					[logics[key].operator]: [{ var: fieldVar }],
					case_sensitive: logics[key].case_sensitive,
				})
			} else if (logics[key].operator === "in") {
				object.push({
					[logics[key].operator]: [logics[key].value, { var: fieldVar }],
					case_sensitive: logics[key].case_sensitive,
				})
			} else {
				object.push({
					[logics[key].operator]: [{ var: fieldVar }, logics[key].value],
					case_sensitive: logics[key].case_sensitive,
				})
			}

			return object
		},

		pushInLogicSimple(object, key, logics) {
			let fieldVar = logics[key].field
			if (logics[key].metadata_field && logics[key].field.includes("metadata")) {
				fieldVar = `${logics[key].field}.${logics[key].metadata_field}`
			}
			if (this.disabledvalue.includes(logics[key].operator)) {
				object[logics[key].operator] = [{ var: fieldVar }]
				object.case_sensitive = logics[key].case_sensitive
			} else if (logics[key].operator === "in") {
				object[logics[key].operator] = [logics[key].value, { var: fieldVar }]
				object.case_sensitive = logics[key].case_sensitive
			} else {
				object[logics[key].operator] = [{ var: fieldVar }, logics[key].value]
				object.case_sensitive = logics[key].case_sensitive
			}

			return object
		},

		async onSubmit(event) {
			event.preventDefault()

			this.successmsg = null
			this.successed = false
			this.errormsg = null
			this.errored = false

			try {
				let logicTmp = {}
				let firstKey = null

				if (this.datavalues.length > 1) {
					logicTmp.or = []
					firstKey = "or"
				}

				this.datavalues.forEach((logics) => {
					if (logics.length > 1) {
						if (firstKey == null) {
							logicTmp.and = []
							firstKey = "and"
						}

						const tmpAnd = { and: [] }

						Object.keys(logics).forEach((key) => {
							if (firstKey === "and") {
								logicTmp.and = this.pushInLogicComplexe(logicTmp.and, key, logics)
							} else {
								tmpAnd.and = this.pushInLogicComplexe(tmpAnd.and, key, logics)
							}
						})

						if (tmpAnd.and.length > 0) {
							logicTmp.or.push(tmpAnd)
						}
					} else if (firstKey == null) {
						logicTmp = this.pushInLogicSimple({}, 0, logics)
					} else {
						Object.keys(logics).forEach((key) => {
							logicTmp.or = this.pushInLogicComplexe(logicTmp.or, key, logics)
						})
					}
				})

				this.logicupdate.logic = logicTmp

				await this.$api.generic.patch(
					`automation/rule/${this.id}/`,
					this.logicupdate
				)

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				this.successmsg = null
				this.successed = false
			}
		},
		onFieldChange(input, masterindex, val) {
			if (input.field === "auth_profile.auth_method") {
				input.operator = "=="

				const configRow = this.datavalues[masterindex]
					.find(c => c.field === 'auth_profile.auth_config')

				if(!configRow) {
					this.addAndCondition(masterindex, 0, this.datavalues)
					const lastIndex = this.datavalues[masterindex].length - 1
					const newCondition = this.datavalues[masterindex][lastIndex]

					newCondition.field = "auth_profile.auth_config"
					newCondition.operator = "=="
					newCondition.value = null
				} else {
					configRow.value = null
				}
			}
		},
		async getAuthMethods() {
			try {
				const methods = await this.$api.generic.get("auth_method/")
				this.authMethods = methods.map(m => ({
					value: m.id,
					text: m.name
				}))
			} catch(e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},
		async getAuthConfigs() {
			try {
				const configs = await this.$api.generic.get("auth_config/")
				this.authConfigs = configs
					.map(c => ({
						value: c.id,
						text: c.name,
						method: c.auth_method
					}))
			} catch(e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},
		isAuthConfigRow(masterindex, input) {
			if (input.field !== "auth_profile.auth_config") {
				return false
			}
			return this.datavalues[masterindex].some(c => 
				c.field === "auth_profile.auth_method"
			)
		},
		removeAuthConfig(masterindex) {
            const configIndex = this.datavalues[masterindex]
                .findIndex(c => c.field === 'auth_profile.auth_config')
            
            if (configIndex !== -1) {
                this.datavalues[masterindex].splice(configIndex, 1)
            }
		}
	}
}
</script>