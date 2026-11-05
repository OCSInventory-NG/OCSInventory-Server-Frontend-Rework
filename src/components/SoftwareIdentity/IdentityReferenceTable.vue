<template>
	<div class="identity-reference">
		<div
			v-if="cancreate"
			class="d-flex mb-3"
		>
			<b-button
				variant="primary"
				class="ms-auto text-nowrap"
				@click="openForm(null)"
			>
				<font-awesome-icon
					:icon="['fas', 'plus']"
					class="me-1"
				/>
				{{ $t('generic.add') }}
			</b-button>
		</div>
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<Datatable
			v-if="ready"
			:id="route + '-datatable'"
			:rowdata="rowdata"
			:rowheader="columnKeys"
			:fieldlabels="columnLabels"
			:candelete="candelete"
			:candeletemultiple="false"
			:usecheckbox="false"
			:hascustomactions="canedit && editableFields.length > 0"
			:isbusy="loading"
			:title="route"
			compactheader
			@reload-datatable="load"
		>
			<template
				v-for="field in columns"
				:key="field"
				#[cellSlot(field)]="{ row }"
			>
				<template v-if="fieldType(field) === 'boolean'">
					<span
						v-if="row.item.source[field]"
						class="badge"
						:class="badgefields[field] || 'bg-green-lt'"
					>{{ booleanLabel(field) }}</span>
				</template>
				<template v-else-if="field === 'source' && (row.item.source[field] === 'shipped' || row.item.source[field] === 'admin')">
					{{ $t('software_identity.source_' + row.item.source[field]) }}
				</template>
				<template v-else-if="fieldType(field) === 'date'">
					{{ formatDay(row.item.source[field]) }}
				</template>
				<template v-else-if="fieldType(field) === 'datetime'">
					{{ formatDateTime(row.item.source[field]) }}
				</template>
				<template v-else>
					{{ display(row.item.source[field]) }}
				</template>
			</template>
			<template #cell(firstActions)="{ row }">
				<button
					v-if="!row.item.is_protected"
					class="btn btn-ghost-dark"
					:title="$t('generic.update')"
					@click="openForm(row.item.source)"
				>
					<font-awesome-icon :icon="['fas', 'pencil']" />
				</button>
			</template>
		</Datatable>
		<div
			v-else
			class="ocs-loader"
		>
			<Loader />
		</div>

		<b-modal
			v-model="formShown"
			:title="editing ? $t('generic.update') : $t('generic.add')"
			hide-footer
			modal-class="custom-modal"
		>
			<div
				v-if="formError"
				class="alert alert-danger"
				role="alert"
			>
				{{ formError }}
			</div>
			<b-form @submit.prevent="submit">
				<b-form-group
					v-for="field in formFields"
					:key="field"
					:label="fieldLabel(field)"
					:label-for="`reference-${field}`"
					class="mb-3"
				>
					<b-form-checkbox
						v-if="fieldType(field) === 'boolean'"
						:id="`reference-${field}`"
						v-model="form[field]"
						switch
					>
						{{ booleanLabel(field) }}
					</b-form-checkbox>
					<b-form-select
						v-else-if="meta[field]?.choices"
						:id="`reference-${field}`"
						v-model="form[field]"
						:options="choiceOptions(field)"
						:required="meta[field]?.required"
					/>
					<b-form-input
						v-else
						:id="`reference-${field}`"
						v-model="form[field]"
						:type="inputType(field)"
						:required="meta[field]?.required"
						:pattern="patterns[field] || null"
						:placeholder="placeholders[field] || ''"
					/>
				</b-form-group>
				<div class="text-center">
					<b-button
						type="submit"
						variant="success"
						:disabled="saving"
					>
						{{ editing ? $t('generic.save') : $t('generic.add') }}
					</b-button>
				</div>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import { apiErrorMessage, asList, formatDateTime, formatDay } from "@/utils/security"

const HIDDEN = ["id"]
// Relations and read-only values are shown, never typed in
const NOT_TYPED = ["field", "nested object", "list", "json", "multiple choice"]

// Reference table of the software identity (origins, distribution releases,
// CPE aliases) built from the OPTIONS of its route
export default {
	name: "IdentityReferenceTable",
	props: {
		route: { type: String, required: true },
		// permission codename suffix, ex: software_identity / packageorigin
		app: { type: String, default: "software_identity" },
		model: { type: String, required: true },
		// columns shown first, in this order
		firstfields: { type: Array, default: () => [] },
		// labels of a true boolean, by field
		booleanlabels: { type: Object, default: () => ({}) },
		badgefields: { type: Object, default: () => ({}) },
		patterns: { type: Object, default: () => ({}) },
		placeholders: { type: Object, default: () => ({}) },
		// rows that cannot be changed nor deleted: {field: value}
		protectedrows: { type: Object, default: () => ({}) },
	},
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			// the datatable is drawn once the columns and the first rows are in
			ready: false,
			rows: [],
			meta: {},
			hasPost: false,

			canadd: hasPermission(`${this.app}_add_${this.model}`),
			canedit: hasPermission(`${this.app}_change_${this.model}`),
			candelete: hasPermission(`${this.app}_delete_${this.model}`),

			formShown: false,
			editing: null,
			form: {},
			formError: null,
			saving: false,
		}
	},
	computed: {
		columns() {
			const fields = Object.keys(this.meta).length
				? Object.keys(this.meta)
				: Object.keys(this.rows[0] || {})
			const rest = fields.filter((field) => !HIDDEN.includes(field) && !this.firstfields.includes(field))
			return [...this.firstfields.filter((field) => fields.includes(field)), ...rest]
		},
		editableFields() {
			return this.columns.filter((field) => {
				const meta = this.meta[field]
				return meta && !meta.read_only && !NOT_TYPED.includes(meta.type)
			})
		},
		// A new row needing a relation cannot be typed here
		cancreate() {
			return this.canadd && this.hasPost && !this.columns.some((field) => {
				const meta = this.meta[field]
				return meta && meta.required && !meta.read_only && NOT_TYPED.includes(meta.type)
			})
		},
		formFields() {
			return this.editableFields
		},
		// every column key is prefixed: the datatable draws some keys itself (created_at, error…)
		columnKeys() {
			return this.columns.map((field) => "col_" + field)
		},
		columnLabels() {
			return Object.fromEntries(this.columns.map((field) => ["col_" + field, this.fieldLabel(field)]))
		},
		// plain values for the search and the sort, the row itself for the cells
		rowdata() {
			return this.rows.map((row) => {
				const item = {
					id: row.id,
					name: String(row[this.columns[0]] ?? row.id),
					is_protected: this.isprotected(row),
					source: row,
				}
				for (const field of this.columns) {
					item["col_" + field] = this.display(row[field])
				}
				return item
			})
		},
	},
	async mounted() {
		try {
			const options = await this.$api.generic.options(`${this.route}/`)
			this.hasPost = !!options?.actions?.POST
			this.meta = options?.actions?.POST || {}
		} catch {
			// columns come from the rows then
		}
		await this.load()
	},
	methods: {
		formatDay,
		formatDateTime,

		async load() {
			this.loading = true
			try {
				this.rows = asList(await this.$api.generic.get(`${this.route}/`))
				this.errored = false
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			} finally {
				this.loading = false
				this.ready = true
			}
		},

		cellSlot(field) {
			return "cell(col_" + field + ")"
		},

		fieldType(field) {
			return this.meta[field]?.type || (typeof this.rows[0]?.[field] === "boolean" ? "boolean" : "string")
		},
		fieldLabel(field) {
			const key = "software_identity.field_" + field
			return this.$te(key) ? this.$t(key) : (this.meta[field]?.label || field)
		},
		booleanLabel(field) {
			return this.booleanlabels[field] || this.$t("generic.yes")
		},
		choiceOptions(field) {
			return (this.meta[field].choices || []).map((choice) => ({ value: choice.value, text: choice.display_name }))
		},
		inputType(field) {
			const type = this.fieldType(field)
			if (type === "date") return "date"
			if (type === "integer" || type === "float" || type === "decimal") return "number"
			return "text"
		},
		display(value) {
			if (value === null || value === undefined || value === "") return ""
			if (Array.isArray(value)) return value.join(", ")
			if (typeof value === "object") return JSON.stringify(value)
			return value
		},
		isprotected(row) {
			return Object.entries(this.protectedrows).some(([field, value]) => row[field] === value)
		},

		openForm(row) {
			this.editing = row
			this.formError = null
			this.form = Object.fromEntries(this.formFields.map((field) => {
				const value = row ? row[field] : null
				return [field, this.fieldType(field) === "boolean" ? !!value : (value ?? "")]
			}))
			this.formShown = true
		},

		async submit() {
			this.saving = true
			this.formError = null
			// an empty date or number means none
			const payload = Object.fromEntries(Object.entries(this.form).map(([field, value]) =>
				[field, value === "" && this.fieldType(field) !== "string" ? null : value]
			))
			try {
				if (this.editing) {
					await this.$api.generic.patch(`${this.route}/${this.editing.id}/`, payload)
				} else {
					await this.$api.generic.post(`${this.route}/`, payload)
				}
				this.formShown = false
				await this.load()
			} catch (e) {
				this.formError = apiErrorMessage(e)
			} finally {
				this.saving = false
			}
		},
	},
}
</script>
