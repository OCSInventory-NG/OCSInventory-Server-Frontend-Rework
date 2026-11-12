<template>
	<div class="modal-allactions">
		<b-row>
			<b-col
				v-if="!first"
				cols="1"
			>
				<b-form-group>
					<SearchSelect
						:id="`link-${idsuffix}`"
						:model-value="criterion.link"
						:options="linkopt"
						:disabled="disabled"
						@update:model-value="set({ link: $event })"
					/>
				</b-form-group>
			</b-col>
			<b-col>
				<b-form-group>
					<SearchSelect
						:id="`route-${idsuffix}`"
						:model-value="criterion.route"
						:options="routeopt"
						:disabled="disabled"
						@update:model-value="selectRoute"
					/>
				</b-form-group>
			</b-col>
			<b-col v-if="criterion.object == 'inventory_sections'">
				<SearchSelect
					:id="`template-${idsuffix}`"
					:model-value="criterion.template"
					:options="templateopt"
					:loading="loadingtemplates"
					:disabled="disabled"
					required
					@update:model-value="selectTemplate"
				/>
			</b-col>
			<b-col v-if="criterion.object == 'inventory_sections'">
				<SearchSelect
					:id="`section-${idsuffix}`"
					:model-value="criterion.section"
					:options="sectionopt"
					:loading="loadingsections"
					:disabled="disabled"
					required
					@update:model-value="selectSection"
				/>
			</b-col>
			<b-col>
				<b-form-group>
					<SearchSelect
						:id="`field-${idsuffix}`"
						:model-value="criterion.field"
						:options="fieldopt"
						:loading="loadingfields"
						:disabled="disabled"
						required
						@update:model-value="selectField"
					/>
				</b-form-group>
			</b-col>
			<b-col cols="2">
				<b-form-group>
					<SearchSelect
						:id="`operator-${idsuffix}`"
						:model-value="criterion.operator"
						:options="operatoropt[criterion.fieldtype]"
						:disabled="disabled"
						required
						@update:model-value="set({ operator: $event })"
					/>
				</b-form-group>
			</b-col>
			<b-col cols="3">
				<b-form-group>
					<SearchSelect
						v-if="SELECT_TYPES.includes(criterion.fieldtype)"
						:id="`value-${idsuffix}`"
						:model-value="criterion.value"
						:options="valueOptions"
						:loading="loadingvalues"
						:disabled="disabled"
						required
						@update:model-value="set({ value: $event })"
					/>
					<b-form-input
						v-else
						:id="`value-${idsuffix}`"
						:model-value="criterion.value"
						:type="INPUT_TYPES[criterion.fieldtype]"
						:step="criterion.fieldtype === 'number' ? 'any' : null"
						class="mb-3"
						:disabled="disabled"
						@update:model-value="set({ value: $event })"
					/>
				</b-form-group>
			</b-col>
			<b-col
				v-if="!disabled"
				cols="1"
			>
				<b-form-group>
					<b-button
						:id="`addfield-${idsuffix}`"
						variant="primary"
						class="form-control"
						:title="$t('search.addquerytogroup')"
						@click="$emit('add')"
					>
						<font-awesome-icon
							:icon="['fas', 'plus']"
						/>
					</b-button>
				</b-form-group>
			</b-col>
			<b-col
				v-if="!disabled"
				v-show="canremove"
				cols="1"
			>
				<b-form-group>
					<b-button
						:id="`removefield-${idsuffix}`"
						variant="danger"
						class="form-control"
						:title="$t('search.removequeryfromgroup')"
						@click="$emit('remove')"
					>
						<font-awesome-icon
							:icon="['fas', 'trash-can']"
						/>
					</b-button>
				</b-form-group>
			</b-col>
		</b-row>
	</div>
</template>

<script>
import { LEVELS } from "@/utils/security"

// object sent to the search for each route of the first select
const ROUTE_OBJECTS = {
	"asset/bases": "InventoryBase",
	"accountinfo/config?datatarget=ASSET": "AccountinfoConfig",
	"deployment/results": "results",
	"asset/logs": "logs",
	"templates": "inventory_sections",
	"snmp/scanner": "snmpscanner",
	"software_dictionary": "software_dictionary_entries",
	"vulnerabilities": "vulnerabilities",
	"security": "security",
}

// fields never offered: ids, relations, computed identity
const EXCLUDED_FIELDS = ["id", "asset", "package", "installation_number", "identity_status", "identity_product", "identity_identifier"]

// account info types, as the search field types
const ACCOUNTINFO_TYPES = {
	"TEXT": "string",
	"TEXTAREA": "string",
	"SELECT": "select",
	"CHECKBOX": "checkbox",
}

const INPUT_TYPES = {
	"string": "text",
	"integer": "number",
	"datetime": "datetime-local",
	"number": "number",
	"date": "date",
}

// types whose value is picked in a list
const SELECT_TYPES = ["select", "checkbox", "choice", "enum", "yesno"]

const SECURITY_FIELD_TYPES = ["number", "date", "enum", "yesno"]

// Security criteria: no OPTIONS route describes them, the fields are listed here.
// "vulnerabilities" = one open CVE of the machine, "security" = the machine as a whole
const SECURITY_ROUTES = {
	vulnerabilities: [
		{ value: "vuln_id", fieldtype: "string" },
		{ value: "level", fieldtype: "enum", choices: LEVELS, labelkey: "security.level_" },
		{ value: "cvss_score", fieldtype: "number" },
		{ value: "epss", fieldtype: "number" },
		{ value: "kev", fieldtype: "yesno" },
		{ value: "fix_available", fieldtype: "yesno" },
		{ value: "software_name", fieldtype: "string" },
		{ value: "version", fieldtype: "string" },
		{ value: "first_seen", fieldtype: "date" },
	],
	security: [
		{
			value: "status",
			fieldtype: "enum",
			choices: ["critical", "high", "medium", "low", "unknown", "not_vulnerable", "not_scanned", "excluded"],
			labelkey: "security.asset_status_",
		},
		{ value: "cves", fieldtype: "number" },
		{ value: "cves_fixable", fieldtype: "number" },
	],
}

// One criterion of the multi-criteria search: its fields, operators and values.
// Each criterion loads its own options, so a row removed or loading leaves the others alone
export default {
	name: "SearchCriterion",
	props: {
		// { object, route, field, fieldtype, operator, value, link, template?, section? }
		criterion: { type: Object, required: true },
		// the first criterion of a group has no AND / OR
		first: { type: Boolean, default: false },
		disabled: { type: Boolean, default: false },
		canremove: { type: Boolean, default: false },
		// "<group>-<row>", for the field ids
		idsuffix: { type: String, required: true },
		routeopt: { type: Array, default: () => [] },
		operatoropt: { type: Object, default: () => ({}) },
		linkopt: { type: Array, default: () => [] },
	},
	// change(patch): the parent applies it to the criterion
	emits: ["change", "add", "remove"],
	data() {
		return {
			INPUT_TYPES,
			SELECT_TYPES,
			fieldopt: [],
			templateopt: [],
			sectionopt: [],
			// account info values, or the choices of a "choice" field
			valueopt: [],
			loadingfields: false,
			loadingtemplates: false,
			loadingsections: false,
			loadingvalues: false,
		}
	},
	computed: {
		valueOptions() {
			const fieldtype = this.criterion.fieldtype
			if (fieldtype === "yesno") {
				return [
					{ value: "yes", text: this.$t("generic.yes") },
					{ value: "no", text: this.$t("generic.no") },
				]
			}
			if (fieldtype === "enum") {
				const field = this.fieldopt.find((element) => element.value === this.criterion.field)
				return (field?.choices || []).map((choice) => ({ value: choice, text: this.$t(field.labelkey + choice) }))
			}
			return this.valueopt
		},
	},
	watch: {
		"$i18n.locale"() {
			this.retranslateFields()
		},
	},
	async mounted() {
		const { route, template, section } = this.criterion
		if (!route) return
		const loads = [this.getFields(route, false, true)]
		if (route === "templates" && template != null && section != null) {
			loads.push(this.getSections(template, true))
			loads.push(this.getFields(section, true, true))
		}
		await Promise.all(loads)
		await this.setFieldType()
	},
	methods: {
		set(patch) {
			this.$emit("change", patch)
		},

		sortByText(a, b) {
			return a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)
		},

		// labels of the fields come from <component>.<field>
		componentOf(route) {
			let component = route.split("/")[0]
			if (component === "asset") component = "inventory"
			if (component === "snmp") component = "network"
			if (component === "software_dictionary") component = "software"
			if (SECURITY_ROUTES[component]) component = "vulnerability_search"
			return component
		},

		retranslateFields() {
			const route = this.criterion.route
			if (!route || route === "accountinfo/config?datatarget=ASSET" || route === "templates") return
			const component = this.componentOf(route)
			this.fieldopt = this.fieldopt
				.map((field) => ({ ...field, text: this.$t(`${component}.${field.value}`) }))
				.sort(this.sortByText)
		},

		async selectRoute(route) {
			this.set({ route })
			await this.getFields(route)
		},
		async selectTemplate(template) {
			this.set({ template })
			await this.getSections(template)
		},
		async selectSection(section) {
			this.set({ section })
			await this.getFields(section, true)
		},
		async selectField(field) {
			this.set({ field })
			await this.setFieldType()
		},

		// template and section only belong to an inventory section criterion
		dropTemplateSection() {
			this.set({ template: undefined, section: undefined })
		},

		// route: a route of the first select, or a section id when section is true;
		// loadingdata: the criterion comes filled (saved search), keep its values
		async getFields(route, section = false, loadingdata = false) {
			if (!loadingdata) {
				this.set({ field: "", value: "", operator: "iexact", fieldtype: "string" })
			}
			if (!section) {
				this.set({ object: ROUTE_OBJECTS[route] })
			}
			this.fieldopt = []
			this.loadingfields = true
			try {
				if (route === "accountinfo/config?datatarget=ASSET") {
					this.dropTemplateSection()
					await this.loadAccountinfoFields()
				} else if (route === "templates") {
					await this.loadTemplates()
				} else if (section) {
					await this.loadSectionFields(route)
				} else if (SECURITY_ROUTES[route]) {
					this.dropTemplateSection()
					this.fieldopt = SECURITY_ROUTES[route]
						.map((field) => ({ ...field, text: this.$t(`vulnerability_search.${field.value}`) }))
						.sort(this.sortByText)
				} else {
					this.dropTemplateSection()
					await this.loadOptionsFields(route)
				}
			} catch {
				// no field to offer: the select stays empty
				this.fieldopt = []
			} finally {
				this.loadingfields = false
			}
		},

		async loadAccountinfoFields() {
			const data = await this.$api.generic.get(
				"accountinfo/config/",
				{},
				{ expand: "accountinfo_values", datatarget: "ASSET" }
			)
			const rows = Array.isArray(data) ? data : (data?.results || [])
			this.fieldopt = rows
				.map((field) => ({ value: field.id, text: field.name, fieldtype: ACCOUNTINFO_TYPES[field.datatype] }))
				.sort(this.sortByText)
		},

		async loadTemplates() {
			this.loadingtemplates = true
			try {
				const data = await this.$api.generic.get("templates/")
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.templateopt = rows.map((template) => ({ value: template.id, text: template.name })).sort(this.sortByText)
			} finally {
				this.loadingtemplates = false
			}
		},

		async loadSectionFields(sectionId) {
			const data = await this.$api.generic.get("fields/", {}, { section: sectionId })
			const rows = Array.isArray(data) ? data : (data?.results || [])
			this.fieldopt = rows
				.map((field) => ({ value: field.id, text: field.name, fieldtype: "string" }))
				.sort(this.sortByText)
		},

		async loadOptionsFields(route) {
			const component = this.componentOf(route)
			const options = await this.$api.generic.options(`${route}/`)
			const post = options?.actions?.POST || {}
			const fields = []
			for (const [field, definition] of Object.entries(post)) {
				if (EXCLUDED_FIELDS.includes(field) || definition?.type === "field") continue
				fields.push({ value: field, text: this.$t(`${component}.${field}`), fieldtype: definition?.type })
				if (definition?.type === "choice") {
					this.valueopt = (definition.choices || [])
						.map((choice) => ({ value: choice.value, text: this.$t("inventory." + choice.value) }))
						.sort(this.sortByText)
				}
			}
			this.fieldopt = fields.sort(this.sortByText)
		},

		async getSections(templateId, loadingdata = false) {
			this.loadingsections = true
			try {
				const data = await this.$api.generic.get("sections/", {}, { template: templateId })
				const rows = Array.isArray(data) ? data : (data?.results || [])
				this.sectionopt = rows.map((section) => ({ value: section.id, text: section.name })).sort(this.sortByText)
				if (!loadingdata) {
					this.set({ section: null, field: "" })
				}
			} catch {
				this.sectionopt = []
			} finally {
				this.loadingsections = false
			}
		},

		async setFieldType() {
			const field = this.fieldopt.find((element) => element.value == this.criterion.field)
			if (field) {
				this.set({ fieldtype: field.fieldtype })
			}
			const fieldtype = this.criterion.fieldtype

			// a security criterion only takes its own operators
			const operators = SECURITY_FIELD_TYPES.includes(fieldtype) ? this.operatoropt[fieldtype] : null
			if (operators && !operators.some((operator) => operator.value === this.criterion.operator)) {
				this.set({ operator: operators[0].value })
			}

			// values of an account info list
			if (fieldtype === "select" || fieldtype === "checkbox") {
				this.loadingvalues = true
				try {
					const data = await this.$api.generic.get("accountinfo/value", {}, { accountinfo_config: this.criterion.field })
					const rows = Array.isArray(data) ? data : (data?.results || [])
					this.valueopt = rows.map((element) => ({ value: element.id, text: element.value }))
				} catch {
					this.valueopt = []
				} finally {
					this.loadingvalues = false
				}
			}
		},
	},
}
</script>
