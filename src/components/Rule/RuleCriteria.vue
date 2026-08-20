<template lang="">
	<div id="rule-criteria">
		<section v-if="successed">
			<Alert 
				:message="$t('message.success_saved')"
				:cols="true"
				variant="success"
			/>
		</section>

		<section v-if="validationerror">
			<Alert
				:message="$t('rule.fill_all_fields')"
				:cols="true"
				variant="warning"
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
							<b-col v-if="supportsInventoryFields">
								<v-select
									v-model="input.filter_type"
									:options="filterTypeOptions"
									:reduce="t => t.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:disabled="viewOnly"
									:placeholder="$t('rule.select_filter_type')"
									@update:model-value="val => onFilterTypeChange(val, input, masterindex, index)"
								/>
							</b-col>
							<b-col v-if="supportsInventoryFields && input.filter_type === 'template'">
								<v-select
									v-model="input.inventory_template"
									:options="templateopt[masterindex]?.[index] || []"
									:loading="loadingtemplate"
									:clearable="false"
									:reduce="t => t.value"
									label="text"
									class="mb-3 ocs-select"
									:disabled="viewOnly"
									:placeholder="$t('compliance.select_template')"
									@open="loadTemplatesIfNeeded(masterindex, index)"
									@update:model-value="val => onTemplateChange(val, input, masterindex, index)"
								/>
							</b-col>
							<b-col
								v-if="supportsInventoryFields
									&& input.filter_type === 'template'
									&& input.inventory_template"
							>
								<v-select
									v-model="input.inventory_section"
									:options="sectionopt[masterindex]?.[index] || []"
									:loading="loadingsection"
									:clearable="false"
									:reduce="s => s.value"
									label="text"
									class="mb-3 ocs-select"
									:disabled="viewOnly"
									:placeholder="$t('compliance.select_section')"
									@update:model-value="val => onSectionChange(val, input, masterindex, index)"
								/>
							</b-col>
							<b-col v-if="supportsInventoryFields && input.filter_type === 'admin'">
								<v-select
									v-model="input.admin_config"
									:options="adminConfigOptions"
									:reduce="opt => opt.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:loading="loadingadminconfig"
									:disabled="viewOnly"
									:placeholder="$t('rule.select_admin_field')"
									@update:model-value="val => onAdminConfigChange(val, input)"
								/>
							</b-col>
							<b-col
								v-if="!supportsInventoryFields || !input.filter_type
									|| input.filter_type === 'base'
									|| input.filter_type === 'software'
									|| (input.filter_type === 'template' && !!input.inventory_section)"
							>
								<b-form-group>
									<v-select
										id="field"
										v-model="input.field"
										:options="getFieldOptions(input, masterindex, index)"
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:loading="(loadingfield) ? true : false"
										:disabled="viewOnly || isAuthConfigRow(masterindex, input)"
										:placeholder="$t('rule.select_field')"
										@update:model-value="() => onFieldChange(input, masterindex)"
									/>
									<b-form-input
										v-if="input.field &&
											(input.field.includes('metadata') ||
												input.field === 'softwares.versions')"
										v-model="input.metadata_field"
										:placeholder="input.field === 'softwares.versions'
											? $t('compliance.software_name_placeholder')
											: 'Metadata field'"
										class="mb-3"
										required
									/>
								</b-form-group>
							</b-col>
							<b-col cols="3">
								<b-form-group>
									<v-select
										id="operator"
										v-model="input.operator"
										:disabled="viewOnly || input.field == 'auth_profile.auth_method'
											|| isAuthConfigRow(masterindex, input)
											|| input.filter_type === 'group'"
										:options="getOperatorOptions(input)"
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
									:id="`case_sensitive-${masterindex}-${index}`"
									v-model="input.case_sensitive"
									name="enabled"
									:value="true"
									:disabled="viewOnly"
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
										:disabled="viewOnly"
										@update:model-value="val => onAuthMethodChange(input, masterindex, val)"
									/>
									<v-select
										v-else-if="input.field === 'auth_profile.auth_config'"
										v-model="input.value"
										:options="getAuthConfigOptions(masterinput, input)"
										:reduce="opt => opt.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:disabled="viewOnly || isAuthConfigValueDisabled(masterinput, input)"
									/>
									<v-select
										v-else-if="isUserGroupField(input)"
										v-model="input.value"
										:options="groups"
										:reduce="opt => opt.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:disabled="viewOnly || disabledvalue.includes(input.operator)"
									/>
									<v-select
										v-else-if="input.filter_type === 'group'"
										v-model="input.value"
										:options="assetGroupOptions"
										:loading="loadingassetgroups"
										:reduce="opt => opt.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:disabled="viewOnly || disabledvalue.includes(input.operator)"
										:placeholder="$t('rule.select_group')"
										@open="loadAssetGroups()"
									/>
									<v-select
										v-else-if="input.filter_type === 'admin'
											&& ['select', 'checkbox'].includes(input.admin_fieldtype)"
										v-model="input.value"
										:options="adminValueOptions[input.admin_config] || []"
										:loading="loadingAdminValues"
										:reduce="opt => opt.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:disabled="viewOnly || disabledvalue.includes(input.operator)"
										:placeholder="$t('rule.select_value')"
									/>
									<b-form-input
										v-else
										id="value"
										v-model="input.value"
										class="mb-3"
										:disabled="viewOnly || (disabledvalue.includes(input.operator)) ? true : false"
										required
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
										:disabled="viewOnly"
										@click="addAndCondition(masterindex, index, datavalues)"
									>
										<font-awesome-icon 
											:icon="['fas', 'plus']"
										/>
									</b-button>
								</b-form-group>
							</b-col>
							<b-col
								v-show="canRemoveCondition && datavalues[masterindex]
									.filter(input => input.field !== 'auth_profile.auth_config').length > 1"
								cols="1"
							>
								<b-form-group>
									<b-button
										v-if="canRemoveCondition && !isAuthConfigRow(masterindex, input)"
										:id="'removefield'+masterindex+index"
										v-b-modal="1"
										variant="danger"
										class="d-none d-sm-inline-block form-control"
										:title="$t('rule.removeandcondition')"
										:disabled="viewOnly"
										@click="
											if (input.field === 'auth_profile.auth_method') {
												removeAuthConfig(masterindex, input);
											}
											removeAndCondition(masterindex, index, datavalues)
										"
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
						:disabled="viewOnly"
						@click="addOrCondition(datavalues)"
					>
						{{ $t('rule.addorcondition') }}
					</b-button>
					<b-button 
						type="submit"
						variant="success"
						:disabled="viewOnly"
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
		logic: { type: Object, default: null },
		viewOnly: { type: Boolean, default: false },
		contextFieldsPath: { type: String, default: null },
		saveApiPath: { type: String, default: null },
		supportsInventoryFields: { type: Boolean, default: false },
		canRemoveCondition: { type: Boolean, default: true },
	},
	emits: ["reloadRule"],
	data() {
		return {
			errormsg: null,
			errorCode: null,
			errored: false,

			successed: false,
			successmsg: null,

			validationerror: false,

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
			authMethods: [],
			authConfigs: [],
			groups: [],

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
						metadata_field: null,
						inventory_template: null,
						inventory_section: null,
						filter_type: null,
						admin_config: null,
						admin_fieldtype: null,
					}
				]
			],
			links: [ "and", "or" ],
			disabledvalue: ["!!", "!"],
			authLinkCounter: 0,

			hasSoftware: false,
			adminConfigOptions: [],
			loadingadminconfig: false,
			adminValueOptions: {},
			loadingAdminValues: false,
			assetGroupOptions: [],
			loadingassetgroups: false,

			loading: true,
			loadingfield: true,
			templateopt: [],
			sectionopt: [],
			invfieldopt: [],
			loadingtemplate: false,
			loadingsection: false,
		}
	},
	computed: {
		filterTypeOptions() {
			const options = [
				{ value: 'base', text: this.$t('rule.filter_type_base') },
				{ value: 'template', text: this.$t('rule.filter_type_template') },
				{ value: 'group', text: this.$t('rule.filter_type_group') },
				{ value: 'admin', text: this.$t('rule.filter_type_admin') },
			]
			if (this.hasSoftware) {
				options.push({ value: 'software', text: this.$t('rule.filter_type_software') })
			}
			return options
		},
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
		await this.getGroups()
		if (this.supportsInventoryFields) {
			this.loadAssetGroups()
			this.loadAdminConfigsIfNeeded()
		}
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

				const [data, contextFields] = await Promise.all([
					this.$api.generic.options(route),
					this.loadContextFields(),
				])

				const contextParents = new Set(Object.keys(contextFields || {}))
				this.hasSoftware = contextParents.has('softwares')

				this.fields = []

				const skipFields = ["inventory_sections", "matched", "group_assignments"]
				Object.keys(data?.actions?.POST || {}).forEach((field) => {
					if (skipFields.includes(field)) return
					if (contextParents.has(field) || contextParents.has(field.replace(/_id$/, ''))) return
					this.fields.push({
						value: field,
						text: this.$t(key + field),
					})
				})

				Object.keys(contextFields || {}).forEach(parent => {
					Object.keys(contextFields[parent]).forEach(child => {
						const fullPath = `${parent}.${child}`
						if (!this.fields.find(f => f.value === fullPath)) {
							this.fields.push({
								value: fullPath,
								text: this.$t(`trigger_fields.${fullPath}`, fullPath)
							})
						}
					})
				})

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

		async loadContextFields() {
			// Compliance passes an explicit endpoint that returns the context
			// schema dict directly; automation rules derive it from the trigger.
			if (this.contextFieldsPath) {
				return await this.$api.generic.get(this.contextFieldsPath)
			}
			const triggers = await this.$api.generic.get("automation/triggers/")
			const list = Array.isArray(triggers) ? triggers : (triggers?.results || [])
			const triggerObj = list.find(t => t.trigger === this.trigger)
			return triggerObj?.context_fields || {}
		},

		async getLogicRow() {
			if (this.logic && Object.keys(this.logic).length > 0) {
				this.datavalues = []
			}

			let masterindex = 0

			Object.keys(this.logic || {}).forEach((key) => {
				if (!this.links.includes(key)) {
					if (key !== "case_sensitive") {
						{
							let fullVar = this.logic[key][0]?.var ?? this.logic[key][1]?.var
							let metadata_field = null

							if (fullVar && fullVar.includes(".metadata.")) {
								metadata_field = fullVar.split(".metadata.")[1]
								fullVar = fullVar.split(".metadata.")[0] + ".metadata"
							}
							if (fullVar && fullVar.startsWith("softwares.versions.")) {
								metadata_field = fullVar.split("softwares.versions.")[1]
								fullVar = "softwares.versions"
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
						}
					} else {
						this.datavalues[0][0].case_sensitive = this.logic[key]
					}
				} else if (key === "and") {
					this.datavalues[masterindex] = []

					Object.keys(this.logic[key]).forEach((and) => {
						Object.keys(this.logic[key][and]).forEach((operator) => {
							if (operator !== "case_sensitive") {
								this.datavalues[masterindex].push({
									field: this.logic[key][and][operator][0]?.var
										?? this.logic[key][and][operator][1]?.var,
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
						const currentIndex = masterindex
						this.datavalues[currentIndex] = []

						Object.keys(this.logic[key][or]).forEach((key2) => {
							if (key2 === "and") {
								Object.keys(this.logic[key][or][key2]).forEach((and) => {
									Object.keys(this.logic[key][or][key2][and]).forEach((operator) => {
										if (operator !== "case_sensitive") {
											this.datavalues[currentIndex].push({
												field: this.logic[key][or][key2][and][operator][0]?.var
													?? this.logic[key][or][key2][and][operator][1]?.var,
												operator: operator,
												value: (this.logic[key][or][key2][and][operator][1]
													&& this.logic[key][or][key2][and][operator][1].var)
													? this.logic[key][or][key2][and][operator][0]
													: (this.logic[key][or][key2][and][operator][1]
														? this.logic[key][or][key2][and][operator][1]
														: null),
											})
										} else {
											this.datavalues[currentIndex][
												this.datavalues[currentIndex].length - 1
											].case_sensitive =
												this.logic[key][or][key2][and][operator]
										}
									})
								})
							} else {
								if (key2 !== "case_sensitive") {
									this.datavalues[currentIndex].push({
										field: this.logic[key][or][key2][0]?.var
											?? this.logic[key][or][key2][1]?.var,
										operator: key2,
										value: (this.logic[key][or][key2][1] && this.logic[key][or][key2][1].var)
											? this.logic[key][or][key2][0]
											: (this.logic[key][or][key2][1]
												? this.logic[key][or][key2][1]
												: null),
									})
								} else {
									this.datavalues[currentIndex][
										this.datavalues[currentIndex].length - 1
									].case_sensitive =
										this.logic[key][or][key2]
								}
							}
						})

						masterindex++
					})
				}
			})
			this.datavalues.forEach(masterInput => {
				masterInput.forEach(input => {
					if (input.field && input.field.includes(".metadata.") && input.metadata_field == null) {
						input.metadata_field = input.field.split(".metadata.")[1]
						input.field = input.field.split(".metadata.")[0] + ".metadata"
					}
					if (input.field && input.field.startsWith("softwares.versions.") && input.metadata_field == null) {
						input.metadata_field = input.field.split("softwares.versions.")[1]
						input.field = "softwares.versions"
					}
				})
			})
			this.datavalues = JSON.parse(JSON.stringify(this.datavalues))
			this.normalizeAuthConditions()
			this.normalizeGroupConditions()

			if (this.supportsInventoryFields) {
				await this.loadAdminConfigsIfNeeded()
			}

			this.datavalues.forEach(masterInput => {
				masterInput.forEach(input => {
					if (input.filter_type || !input.field) return
					if (input.field.startsWith('inventory.')) {
						input.filter_type = 'template'
					} else if (input.field === 'group_ids') {
						input.filter_type = 'group'
					} else if (input.field.startsWith('accountinfo.')) {
						input.filter_type = 'admin'
						const configId = parseInt(input.field.split('.')[1])
						if (!isNaN(configId)) {
							input.admin_config = configId
							const config = this.adminConfigOptions.find(o => o.value === configId)
							const linktype = { TEXT: 'string', TEXTAREA: 'string', SELECT: 'select', CHECKBOX: 'checkbox' }
							input.admin_fieldtype = linktype[config?.datatype] || 'string'
							if (['select', 'checkbox'].includes(input.admin_fieldtype)) {
								this.loadAdminValues(configId)
							}
						}
					} else if (input.field.startsWith('softwares.')) {
						input.filter_type = 'software'
					} else {
						input.filter_type = 'base'
					}
				})
			})

			await this.restoreTemplateConditions()

			await this.getModelField()
		},

		// On reload, a template condition only stores "inventory.<fieldId>".
		// Rebuild the template/section selections (field -> section -> template)
		// and repopulate the cascading dropdown options so they stay editable.
		// datavalues is a 2D array (OR groups x AND conditions) -> two loops.
		async restoreTemplateConditions() {
			for (const [m, row] of this.datavalues.entries()) {
				for (const [i, input] of row.entries()) {
					if (input.filter_type !== 'template' || !input.field?.startsWith('inventory.')) {
						continue
					}
					try {
						const field = await this.$api.generic.get(`fields/${input.field.split('.')[1]}/`)
						const section = await this.$api.generic.get(`sections/${field.section}/`)
						input.inventory_template = section.template
						input.inventory_section = field.section
						await this.loadTemplatesIfNeeded(m, i)
						if (!Array.isArray(this.sectionopt[m])) this.sectionopt[m] = []
						const sdata = await this.$api.generic.get('sections/', {}, { template: section.template })
						this.sectionopt[m][i] = (Array.isArray(sdata) ? sdata : (sdata?.results || []))
							.map(s => ({ value: s.id, text: s.name }))
							.sort((a, b) => a.text > b.text ? 1 : -1)
						if (!Array.isArray(this.invfieldopt[m])) this.invfieldopt[m] = []
						const fdata = await this.$api.generic.get('fields/', {}, { section: field.section })
						this.invfieldopt[m][i] = (Array.isArray(fdata) ? fdata : (fdata?.results || []))
							.map(f => ({ value: 'inventory.' + f.id, text: f.name }))
							.sort((a, b) => a.text > b.text ? 1 : -1)
					} catch {
						// leave the condition as-is if the lookups fail
					}
				}
			}
		},

		getFieldOptions(input, masterindex, index) {
			if (this.supportsInventoryFields && input.inventory_section
				&& this.invfieldopt[masterindex]?.[index]) {
				return this.invfieldopt[masterindex][index]
			}
			return this.fields.filter(option => {
				const isSoftware = option.value.startsWith('softwares.')
				if (this.hasSoftware) {
					if (input.filter_type === 'software') {
						if (!isSoftware) return false
					} else if (isSoftware) {
						return false
					}
				}
				if (option.value !== 'auth_profile.auth_config') return true
				return input.field === 'auth_profile.auth_config'
			})
		},

		addAndCondition(masterindex, index, fieldType) {
			fieldType[masterindex].push({
				field: "id",
				operator: "==",
				value: null,
				case_sensitive: false,
				metadata_field: null,
				inventory_template: null,
				inventory_section: null,
				filter_type: "base",
				admin_config: null,
				admin_fieldtype: null,
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
				metadata_field: null,
				inventory_template: null,
				inventory_section: null,
				filter_type: "base",
				admin_config: null,
				admin_fieldtype: null,
			})

			this.datavalues = JSON.parse(JSON.stringify(fieldType))
		},

		removeOrCondition(masterindex, fieldType) {
			fieldType.splice(masterindex, 1)
		},

		pushInLogicComplexe(object, key, logics) {
			let fieldVar = logics[key].field
			const hasMetadataC = logics[key].metadata_field
				&& (logics[key].field.includes("metadata") || logics[key].field === "softwares.versions")
			if (hasMetadataC) {
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
			const hasMetadataS = logics[key].metadata_field
				&& (logics[key].field.includes("metadata") || logics[key].field === "softwares.versions")
			if (hasMetadataS) {
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

		// v-select fields can't use native "required"; validate them here
		// (value is optional only for operators that take none: !!, !).
		rowsComplete() {
			return this.datavalues.every(masterinput => masterinput.every(input =>
				input.field
				&& (!this.supportsInventoryFields || input.filter_type)
				&& (this.disabledvalue.includes(input.operator) || (input.value != null && input.value !== ''))
			))
		},

		async onSubmit(event) {
			event.preventDefault()

			this.successmsg = null
			this.successed = false
			this.errormsg = null
			this.errored = false
			this.validationerror = false

			if (!this.rowsComplete()) {
				this.validationerror = true
				return
			}

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
					this.saveApiPath || `automation/rule/${this.id}/`,
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
		getAuthMethodId(name, fallback = null) {
			const normalized = String(name || "").toUpperCase()
			const match = this.authMethods.find(method => method.name === normalized)
			return match ? match.value : fallback
		},
		normalizeComparableId(value) {
			const numericValue = Number(value)
			return Number.isNaN(numericValue) ? value : numericValue
		},
		idsEqual(left, right) {
			return this.normalizeComparableId(left) === this.normalizeComparableId(right)
		},
		createAuthLinkId() {
			this.authLinkCounter += 1
			return `auth-link-${this.authLinkCounter}`
		},
		ensureAuthLinkId(input) {
			if (!input.auth_link_id) {
				input.auth_link_id = this.createAuthLinkId()
			}
			return input.auth_link_id
		},
		getAuthMethodByLink(masterinput, authLinkId) {
			if (!authLinkId) {
				return null
			}
			return masterinput.find(condition =>
				condition.field === "auth_profile.auth_method" && condition.auth_link_id === authLinkId
			) || null
		},
		getSelectedAuthMethod(masterinput) {
			const methodCondition = masterinput.find(
				condition => condition.field === "auth_profile.auth_method"
			)
			return methodCondition ? methodCondition.value : null
		},
		getConfigsByMethod(methodId) {
			return this.authConfigs.filter(config => this.idsEqual(config.method, methodId))
		},
		shouldHaveAuthConfig(methodId) {
			const ldapId = this.getAuthMethodId("LDAP", 2)
			const oidcId = this.getAuthMethodId("OIDC", 3)
			const casId = this.getAuthMethodId("CAS", 4)

			return [ldapId, oidcId, casId].some(id => this.idsEqual(id, methodId))
		},
		onFieldChange(input, masterindex) {
			if (input.field === "auth_profile.auth_method") {
				const localId = this.getAuthMethodId("LOCAL", 1)
				input.operator = "=="
				input.value = localId
				this.ensureAuthLinkId(input)
				this.onAuthMethodChange(input, masterindex, localId)
				return
			}

			input.value = null
			if (this.isUserGroupField(input)) {
				input.operator = "=="
			}
			this.normalizeAuthConditionsForRow(masterindex)
		},
		onAuthMethodChange(input, masterindex, value) {
			input.operator = "=="
			input.value = value
			this.ensureAuthLinkId(input)
			this.syncAuthConfigCondition(masterindex, input)
		},
		syncAuthConfigCondition(masterindex, authMethodInput) {
			const row = this.datavalues[masterindex]
			if (!authMethodInput || authMethodInput.field !== "auth_profile.auth_method") {
				return
			}

			const authLinkId = this.ensureAuthLinkId(authMethodInput)
			const methodId = authMethodInput.value
			const ldapId = this.getAuthMethodId("LDAP", 2)

			if (!this.shouldHaveAuthConfig(methodId)) {
				this.removeAuthConfig(masterindex, authMethodInput)
				return
			}

			let configRow = row.find(condition =>
				condition.field === "auth_profile.auth_config" && condition.auth_link_id === authLinkId
			)

			if (!configRow) {
				configRow = {
					field: "auth_profile.auth_config",
					operator: "==",
					value: null,
					case_sensitive: false,
					metadata_field: null,
					auth_link_id: authLinkId
				}
				const methodIndex = row.indexOf(authMethodInput)
				row.splice(methodIndex + 1, 0, configRow)
			} else {
				const methodIndex = row.indexOf(authMethodInput)
				const configIndex = row.indexOf(configRow)
				if (methodIndex !== -1 && configIndex !== -1 && configIndex !== methodIndex + 1) {
					row.splice(configIndex, 1)
					row.splice(methodIndex + 1, 0, configRow)
				}
			}

			const methodConfigs = this.getConfigsByMethod(methodId)
			const defaultConfig = methodConfigs.length > 0 ? methodConfigs[0].value : null

			configRow.field = "auth_profile.auth_config"
			configRow.operator = "=="
			configRow.case_sensitive = false
			configRow.metadata_field = null
			configRow.auth_link_id = authLinkId

			if (this.idsEqual(methodId, ldapId)) {
				const isCurrentValueAllowed = methodConfigs.some(
					config => this.idsEqual(config.value, configRow.value)
				)
				if (!isCurrentValueAllowed) {
					configRow.value = defaultConfig
				}
			} else {
				configRow.value = defaultConfig
			}
		},
		async getAuthMethods() {
			try {
				const methods = await this.$api.generic.get("auth_method/")
				this.authMethods = methods.map(m => ({
					value: m.id,
					text: m.name,
					name: String(m.name || "").toUpperCase()
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
		async getGroups() {
			try {
				const data = await this.$api.generic.get("groups/")
				const rows = Array.isArray(data) ? data : (data?.results || [])

				this.groups = rows.map(group => ({
					value: group.id,
					text: group.name
				}))
			} catch(e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},
		isUserGroupField(input) {
			return this.trigger === "user_login" && input.field === "groups"
		},
		normalizeGroupConditions() {
			this.datavalues.forEach(masterinput => {
				masterinput.forEach(input => {
					if (!this.isUserGroupField(input) || input.value == null) {
						return
					}

					input.value = this.normalizeComparableId(input.value)
				})
			})
		},
		getAuthConfigOptions(masterinput, input) {
			const linkedMethod = this.getAuthMethodByLink(masterinput, input.auth_link_id)
			const methodId = linkedMethod ? linkedMethod.value : this.getSelectedAuthMethod(masterinput)
			return this.getConfigsByMethod(methodId)
		},
		isAuthConfigValueDisabled(masterinput, input) {
			const linkedMethod = this.getAuthMethodByLink(masterinput, input.auth_link_id)
			const methodId = linkedMethod ? linkedMethod.value : this.getSelectedAuthMethod(masterinput)
			const ldapId = this.getAuthMethodId("LDAP", 2)
			return !this.idsEqual(methodId, ldapId)
		},
		isAuthConfigRow(masterindex, input) {
			if (input.field !== "auth_profile.auth_config") {
				return false
			}
			return this.datavalues[masterindex].some(c => 
				c.field === "auth_profile.auth_method"
			)
		},
		removeAuthConfig(masterindex, authMethodInput = null) {
			const row = this.datavalues[masterindex]
			if (!row) {
				return
			}

			if (authMethodInput?.auth_link_id) {
				const configIndex = row.findIndex(condition =>
					condition.field === "auth_profile.auth_config"
					&& condition.auth_link_id === authMethodInput.auth_link_id
				)
				if (configIndex !== -1) {
					row.splice(configIndex, 1)
				}
				return
			}

			const configIndex = row.findIndex(c => c.field === "auth_profile.auth_config")
			if (configIndex !== -1) {
				row.splice(configIndex, 1)
			}
		},
		normalizeAuthConditionsForRow(masterindex) {
			const row = this.datavalues[masterindex]
			if (!row) {
				return
			}

			const authMethodConditions = row.filter(condition => condition.field === "auth_profile.auth_method")
			const configConditions = row.filter(condition => condition.field === "auth_profile.auth_config")

			// Rebuild auth/config links after reload (link id is UI-only, not persisted).
			authMethodConditions.forEach(authMethodCondition => {
				this.ensureAuthLinkId(authMethodCondition)
			})
			const linkedMethodIds = new Set(
				configConditions
					.filter(condition => !!condition.auth_link_id)
					.map(condition => condition.auth_link_id)
			)
			row.forEach((condition, index) => {
				if (condition.field !== "auth_profile.auth_config" || condition.auth_link_id) {
					return
				}

				for (let scanIndex = index - 1; scanIndex >= 0; scanIndex -= 1) {
					const candidate = row[scanIndex]
					if (candidate.field !== "auth_profile.auth_method") {
						continue
					}

					const candidateLinkId = this.ensureAuthLinkId(candidate)
					if (!this.shouldHaveAuthConfig(candidate.value) || linkedMethodIds.has(candidateLinkId)) {
						continue
					}

					condition.auth_link_id = candidateLinkId
					linkedMethodIds.add(candidateLinkId)
					break
				}
			})

			const activeLinkedMethodIds = new Set()

			authMethodConditions.forEach(authMethodCondition => {
				const localId = this.getAuthMethodId("LOCAL", 1)
				authMethodCondition.operator = "=="
				if (authMethodCondition.value == null) {
					authMethodCondition.value = localId
				}

				const linkId = this.ensureAuthLinkId(authMethodCondition)
				activeLinkedMethodIds.add(linkId)
				this.syncAuthConfigCondition(masterindex, authMethodCondition)
			})

			for (let index = row.length - 1; index >= 0; index -= 1) {
				const condition = row[index]
				if (condition.field !== "auth_profile.auth_config") {
					continue
				}

				if (!condition.auth_link_id || !activeLinkedMethodIds.has(condition.auth_link_id)) {
					row.splice(index, 1)
				}
			}
		},
		normalizeAuthConditions() {
			this.datavalues.forEach((_row, masterindex) => {
				this.normalizeAuthConditionsForRow(masterindex)
			})
		},

		async loadTemplatesIfNeeded(masterindex, index) {
			if (this.templateopt[masterindex]?.[index]?.length > 0) return
			this.loadingtemplate = true
			if (!Array.isArray(this.templateopt[masterindex])) this.templateopt[masterindex] = []
			try {
				const data = await this.$api.generic.get('templates/')
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.templateopt[masterindex][index] = rows
					.map(t => ({ value: t.id, text: t.name }))
					.sort((a, b) => a.text > b.text ? 1 : -1)
			} catch {
				// ignore fetch error
			}
			this.loadingtemplate = false
		},

		async onTemplateChange(templateId, input, masterindex, index) {
			input.inventory_section = null
			input.field = ''
			if (!Array.isArray(this.sectionopt[masterindex])) this.sectionopt[masterindex] = []
			this.sectionopt[masterindex][index] = []
			if (!Array.isArray(this.invfieldopt[masterindex])) this.invfieldopt[masterindex] = []
			this.invfieldopt[masterindex][index] = []
			if (!templateId) return
			this.loadingsection = true
			try {
				const data = await this.$api.generic.get('sections/', {}, { template: templateId })
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.sectionopt[masterindex][index] = rows
					.map(s => ({ value: s.id, text: s.name }))
					.sort((a, b) => a.text > b.text ? 1 : -1)
			} catch {
				// ignore fetch error
			}
			this.loadingsection = false
		},

		async onSectionChange(sectionId, input, masterindex, index) {
			input.field = ''
			if (!Array.isArray(this.invfieldopt[masterindex])) this.invfieldopt[masterindex] = []
			this.invfieldopt[masterindex][index] = []
			if (!sectionId) return
			this.loadingfield = true
			try {
				const data = await this.$api.generic.get('fields/', {}, { section: sectionId })
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.invfieldopt[masterindex][index] = rows
					.map(f => ({ value: 'inventory.' + f.id, text: f.name }))
					.sort((a, b) => a.text > b.text ? 1 : -1)
			} catch {
				// ignore fetch error
			}
			this.loadingfield = false
		},

		onFilterTypeChange(type, input, masterindex, index) {
			input.field = ''
			input.value = null
			input.inventory_template = null
			input.inventory_section = null
			input.admin_config = null
			input.admin_fieldtype = null
			if (!Array.isArray(this.sectionopt[masterindex])) this.sectionopt[masterindex] = []
			this.sectionopt[masterindex][index] = []
			if (!Array.isArray(this.invfieldopt[masterindex])) this.invfieldopt[masterindex] = []
			this.invfieldopt[masterindex][index] = []
			if (type === 'group') {
				input.field = 'group_ids'
				input.operator = 'in'
			} else if (type === 'base') {
				input.operator = '=='
			}
		},

		getOperatorOptions(input) {
			if (input.filter_type === 'admin' && input.admin_fieldtype) {
				const allowed = {
					select:   ['==', '!='],
					checkbox: ['==', '!='],
					string:   ['==', '!=', 'in'],
				}
				const keys = allowed[input.admin_fieldtype] || allowed.string
				return this.operators.filter(o => keys.includes(o.value))
			}
			return this.operators
		},

		onAdminConfigChange(configId, input) {
			input.field = configId ? `accountinfo.${configId}` : ''
			input.value = null
			const config = this.adminConfigOptions.find(o => o.value === configId)
			const linktype = { TEXT: 'string', TEXTAREA: 'string', SELECT: 'select', CHECKBOX: 'checkbox' }
			input.admin_fieldtype = linktype[config?.datatype] || 'string'
			const allowed = { select: ['==', '!='], checkbox: ['==', '!='], string: ['==', '!=', 'in'] }
			const validOps = allowed[input.admin_fieldtype] || allowed.string
			if (!validOps.includes(input.operator)) {
				input.operator = '=='
			}
			if (['select', 'checkbox'].includes(input.admin_fieldtype)) {
				this.loadAdminValues(configId)
			}
		},

		async loadAssetGroups() {
			if (this.assetGroupOptions.length > 0) return
			this.loadingassetgroups = true
			try {
				const data = await this.$api.generic.get('asset/groups/')
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.assetGroupOptions = rows
					.map(g => ({ value: g.id, text: g.name }))
					.sort((a, b) => a.text > b.text ? 1 : -1)
			} catch {
				// ignore fetch error
			}
			this.loadingassetgroups = false
		},

		async loadAdminConfigsIfNeeded() {
			if (this.adminConfigOptions.length > 0) return
			this.loadingadminconfig = true
			try {
				const data = await this.$api.generic.get('accountinfo/config/', {}, { datatarget: 'ASSET' })
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.adminConfigOptions = rows
					.map(c => ({ value: c.id, text: c.name, datatype: c.datatype }))
					.sort((a, b) => a.text > b.text ? 1 : -1)
			} catch {
				// ignore fetch error
			}
			this.loadingadminconfig = false
		},

		async loadAdminValues(configId) {
			if (this.adminValueOptions[configId]) return
			this.loadingAdminValues = true
			try {
				const data = await this.$api.generic.get('accountinfo/value/', {}, { accountinfo_config: configId })
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.adminValueOptions[configId] = rows.map(el => ({ value: el.value, text: el.value }))
			} catch {
				this.adminValueOptions[configId] = []
			}
			this.loadingAdminValues = false
		},
	}
}
</script>
