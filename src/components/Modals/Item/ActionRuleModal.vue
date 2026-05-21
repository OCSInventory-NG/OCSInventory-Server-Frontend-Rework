<template>
	<div id="action-rule-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('rule.addaction')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('rule.addaction') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('rule.editaction')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="actionrulemodal" 
			v-model="rulemodal"
			:title="(!update) ? $t('rule.addaction') : $t('generic.change')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('rule.addaction') : $t('generic.change') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="createerror"
						:icon="['fas', 'xmark']"
						color="red"
					/>
				</h5>
				<b-button 
					size="sm" 
					variant="outline-danger" 
					@click="close()"
				>
					<font-awesome-icon 
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('rule.object')" 
							label-for="object"
						>
							<v-select
								id="object"
								v-model="row.object_slug"
								:options="objectOptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
								@option:selected="onObjectSelected"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('rule.action')" 
							label-for="action"
						>
							<v-select
								id="action"
								v-model="row.action"
								:options="actionOptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('rule.field')" 
							label-for="field"
						>
							<v-select
								id="field"
								v-model="row.field"
								:options="fieldOptions"
								:reduce="text => text.value"
								:clearable="false"
								:disabled="!row.object_slug"
								:loading="loadingFieldOptions"
								label="text"
								class="mb-3 ocs-select"
								@option:selected="onFieldSelected"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.value')" 
							label-for="value"
						>
							<v-select
								v-if="isValueSelect"
								id="value"
								:key="valueOptions.length"
								v-model="row.value"
								:options="valueOptions"
								:reduce="text => text.value"
								:multiple="selectedFieldType === 'checkbox'"
								:close-on-select="true"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
								:loading="loadingValueOptions"
							/>
							<b-form-input
								v-else
								id="value"
								v-model="row.value"
								:type="valueInputType"
								class="mb-3"
								:disabled="!row.field"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "ActionRuleModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: [Number, String], default: null },
		trigger: { type: String, default: null },
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				id: null,
				rule: null,
				priority: 1,
				action: null,
				field: null,
				value: null,
				content_type: null,
				object_id: null,
				object_slug: null,
			},
			rulemodal: false,
			actionOptions: [],
			fieldOptions: [],
			valueOptions: [],
			loadingValueOptions: false,
			loadingFieldOptions: false,
			selectedFieldType: null,
			resolvedTrigger: null,
			actionstrigger: {},

			routeopt: {
				inventory_received: [
					{ value: "accountinfo.accountinfoconfig", text: this.$t("title.accountinfo") },
					{ value: "inventory_base.inventorybase", text: this.$t("title.assets") },
				],
				user_login: [
					{ value: "auth.user", text: this.$t("title.users") },
				],
				netdevice_received: [
					{ value: "accountinfo.accountinfoconfig", text: this.$t("title.accountinfo") },
				],
			},
			routetargets: {
				inventory_received: {
					"accountinfo.accountinfoconfig": {
						route: "accountinfo/config/?datatarget=ASSET",
						key: "accountinfo",
					},
					"inventory_base.inventorybase": {
						route: "asset/bases/",
						key: "inventory",
					},
				},
				user_login: {
					"auth.user": {
						route: "users/",
						key: "user",
					},
				},
				netdevice_received: {
					"accountinfo.accountinfoconfig": {
						route: "accountinfo/config/?datatarget=IPDISCOVER",
						key: "accountinfo",
					},
				},
			},
			selectfield: ["select", "checkbox", "field"],
			inputype: {
				string: "text",
				integer: "number",
				datetime: "datetime-local",
			},
			linktype: {
				TEXT: "string",
				TEXTAREA: "string",
				SELECT: "select",
				CHECKBOX: "checkbox",
			},

			loading: true,
			loadingcreate: false,
		}
	},
	computed: {
		activeTrigger() {
			return this.trigger || this.resolvedTrigger
		},
		objectOptions() {
			return this.routeopt[this.activeTrigger] || []
		},
		isValueSelect() {
			return this.selectfield.includes(this.selectedFieldType)
				|| this.row.field === "template"
		},
		valueInputType() {
			return this.inputype[this.selectedFieldType] || "text"
		},
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.rulemodal = false
				this.createwithsuccess = false
				this.resolvedTrigger = null
				this.row = {
					id: null,
					rule: this.id ? Number(this.id) : null,
					priority: 1,
					action: null,
					field: null,
					value: null,
					object_slug: null,
				}
				this.$emit("reloadDatatable")
			}, 500)
		},
		'row.field': {
			handler() {
				this.handleFieldChange()
			},
		},
	},
	mounted() {
		if(!this.update) {
			this.row.rule = this.id ? Number(this.id) : null
			this.loading = false
		}
		this.loadActionTargets()
		this.loadOptions()
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadOptions() {
			try {
				const options = await this.$api.generic.options("automation/action/")
				const postFields = options.actions.POST

				if (postFields.action && postFields.action.choices) {
					this.actionOptions = postFields.action.choices.map(choice => ({
						value: choice.value,
						text: choice.display_name || choice.value
					}))
				} else {
					this.actionOptions = [
						{ value: 'set', text: this.$t('rule.set') }
					]
				}

			} catch (e) {
				this.actionOptions = [
					{ value: 'set', text: this.$t('rule.set') }
				]
			}
		},

		async loadActionTargets() {
			try {
				let triggers = this.triggers
				if (!triggers?.length) {
					const data = await this.$api.generic.get("automation/triggers/")
					triggers = Array.isArray(data) ? data : (data?.results || [])
				}
				const triggerObj = triggers.find((t) => t.trigger === this.activeTrigger)
				this.actionstrigger = triggerObj?.action_targets || {}
			} catch (e) {
				this.actionstrigger = {}
			}
		},

		normalizeObjectSlug(slug) {
			if (!slug) return null
			const allOptions = Object.values(this.routeopt || {}).flat()
			const match = allOptions.find(
				(o) => o.value.toLowerCase() === String(slug).toLowerCase()
			)
			return match ? match.value : slug
		},

		inferObjectSlugFromField(field) {
			if (!field) return null

			if (field.startsWith("accountdata:")) {
				return "accountinfo.accountinfoconfig"
			}

			const models = Object.keys(this.actionstrigger || {})
			for (const model of models) {
				if ((this.actionstrigger[model] || []).includes(field)) {
					return model
				}
			}

			return null
		},

		parseRowFromApi(data) {
			const row = { ...data }
			row.object_slug = this.normalizeObjectSlug(data.object_slug)

			if (data.field?.startsWith("accountdata:")) {
				const parts = data.field.split(":")
				row.object_slug = "accountinfo.accountinfoconfig"
				row.field = parts[1]

				if (Array.isArray(data.value)) {
					this.selectedFieldType = "checkbox"
					row.value = data.value.map((item) => String(item))
				} else if (data.value && typeof data.value === "object" && data.value.value !== undefined) {
					this.selectedFieldType = "select"
					row.value = String(data.value.value)
				} else {
					this.selectedFieldType = "string"
					row.value = String(data.value ?? "")
				}
			} else if (data.field === "template") {
				this.selectedFieldType = "field"
			} else {
				if (!row.object_slug) { 
					row.object_slug = this.inferObjectSlugFromField(data.field)
				}
				this.selectedFieldType = "string"
			}

			return row
		},

		onFieldSelected(option) {
			this.selectedFieldType = option?.fieldtype || null
			this.row.value = null
			this.handleFieldChange()
		},

		onObjectSelected() {
			this.row.field = null
			this.row.value = null
			this.selectedFieldType = null
			this.fieldOptions = []
			this.valueOptions = []
			this.loadFieldOptions(true).catch(() => {})
		},

		async loadFieldOptions(reload = false) {
			const model = this.row.object_slug
			if (!model) {
				this.fieldOptions = []
				return
			}

			const target = this.routetargets[this.activeTrigger]?.[model]
			if (!target) {
				this.fieldOptions = []
				return
			}

			if (reload) {
				this.row.field = null
				this.row.value = null
				this.selectedFieldType = null
				this.valueOptions = []
			}

			this.loadingFieldOptions = true
			try {
				if (model === "accountinfo.accountinfoconfig") {
					const data = await this.$api.generic.get(target.route)
					const list = Array.isArray(data) ? data : (data?.results ?? data ?? [])

					this.fieldOptions = list
						.map((field) => ({
							value: field.id.toString(),
							text: field.name,
							fieldtype: this.linktype[field.datatype] || "string",
						}))
						.sort((a, b) => (a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)))
				} else {
					const opt = await this.$api.generic.options(target.route)
					const allowed = this.actionstrigger[model] || []

					this.fieldOptions = []
					for (const field in opt.actions.POST) {
						if (allowed.includes(field)) {
							const labelKey = `${target.key}.${field}`
							this.fieldOptions.push({
								value: field.toString(),
								text: this.$te(labelKey) ? this.$t(labelKey) : field,
								fieldtype: opt.actions.POST[field].type,
							})
						}
					}
					this.fieldOptions.sort((a, b) => (a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)))
				}
			} catch (e) {
				this.fieldOptions = []
			} finally {
				this.loadingFieldOptions = false
			}
		},

		buildActionPayload(base) {
			const payload = { ...base }
			const model = this.row.object_slug
			const selected = this.fieldOptions.find((f) => f.value == this.row.field)
			const fieldtype = selected?.fieldtype || this.selectedFieldType

			if (model === "accountinfo.accountinfoconfig") {
				payload.object_id = this.row.field
				payload.object_slug = model.toLowerCase()

				if (fieldtype === "checkbox") {
					payload.field = `accountdata:${this.row.field}`
					payload.value = Array.isArray(this.row.value)
						? this.row.value.map((item) => parseInt(item, 10)).filter((item) => !Number.isNaN(item))
						: []
				} else if (fieldtype === "select") {
					payload.field = `accountdata:${this.row.field}`
					const normalizedId = String(this.row.value || "").replace(/\[|\]/g, "")
					const parsedId = parseInt(normalizedId, 10)
					const option = this.valueOptions.find((o) => o.value == normalizedId)
					payload.value = {
						value: Number.isNaN(parsedId) ? normalizedId : parsedId,
						text: option?.text || "",
					}
				} else {
					payload.field = `accountdata:${this.row.field}`
					payload.value = this.row.value
				}
			} else {
				payload.field = this.row.field
				payload.value = this.row.value
				if (model) {
					payload.object_slug = model
				}
			}

			return payload
		},

		loadData(id) {
			this.rulemodal = true
			this.resolvedTrigger = null
			this.row = {
				id: null,
				rule: this.id,
				priority: 1,
				action: null,
				field: null,
				value: null,
				object_slug: null,
			}
			this.valueOptions = []
			this.fieldOptions = []
			this.selectedFieldType = null

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getAction(id)
			}
		},

		async getAction(id) {
			try {
				const data = await this.$api.generic.get(`automation/action/${id}/`)
				this.errormsg = null
				this.errored = false

				if (!this.activeTrigger && data?.rule) {
					const rule = await this.$api.generic.get(`automation/rule/${data.rule}/`)
					this.resolvedTrigger = rule?.trigger || null
				}
				await this.loadActionTargets()

				this.row = this.parseRowFromApi(data)
				if (!this.row.object_slug) {
					this.row.object_slug = this.inferObjectSlugFromField(this.row.field || data.field)
				}

				if (this.row.object_slug) {
					await this.loadFieldOptions(false)
					await this.handleFieldChange()
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async calculatePriority(id) {
			try {
				const response = await this.$api.generic.get(`automation/action/?rule=${id}`)
				const actions = Array.isArray(response)
					? response
					: response.results ?? response

				const maxPriority = actions.length
					? Math.max(...actions.map((action) => Number(action.priority) || 0))
					: 0

				return maxPriority + 1
			} catch (e) {
				return 1
			}
		},

		async onSubmit(event) {
			event.preventDefault();
			this.loadingcreate = true;

			this.createwithsuccess = false;
			this.createerror = false;
			this.createerrormsg = null;

			try {
				const priority = this.update ? this.row.priority : await this.calculatePriority(this.id);

				if (!this.update) {
					const payload = this.buildActionPayload({
						rule: this.id ? Number(this.id) : null,
						priority: priority,
						action: this.row.action,
					})

					await this.$api.generic.post("automation/action/", payload);
				} else {
					const payload = this.buildActionPayload({
						priority: priority,
						action: this.row.action,
					})

					await this.$api.generic.patch(`automation/action/${this.row.id}/`, payload);
				}

				this.createwithsuccess = true;
			} catch (e) {
				this.createerrormsg = this._apiError(e);
				this.createerror = true;
				this.createwithsuccess = false;
			} finally {
				this.loadingcreate = false;
			}
		},

		async handleFieldChange() {
			this.valueOptions = []

			if (!this.row.field) return

			const selected = this.fieldOptions.find((f) => f.value == this.row.field)
			this.selectedFieldType = selected?.fieldtype || this.selectedFieldType

			if (this.selectedFieldType === "field" || this.row.field === "template") {
				this.loadingValueOptions = true
				try {
					const route = this.row.field === "template" ? "templates/" : `${this.row.field}/`
					const response = await this.$api.generic.get(route)
					const items = Array.isArray(response)
						? response
						: response.results ?? response

					this.valueOptions = (items || []).map((item) => ({
						value: item.id.toString(),
						text: item.name || item.id,
					}))
				} catch (e) {
					this.valueOptions = []
				} finally {
					this.loadingValueOptions = false
				}
			} else if (this.selectedFieldType === "select" || this.selectedFieldType === "checkbox") {
				this.loadingValueOptions = true
				try {
					const response = await this.$api.generic.get(
						"accountinfo/value/",
						{ accountinfo_config: this.row.field }
					)
					const values = Array.isArray(response)
						? response
						: response.results ?? response

					this.valueOptions = (values || []).map((item) => ({
						value: item.id.toString(),
						text: item.value,
					}))
				} catch (e) {
					this.valueOptions = []
				} finally {
					this.loadingValueOptions = false
				}
			}
		},
	},
}
</script>