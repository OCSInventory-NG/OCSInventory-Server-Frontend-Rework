<template>
	<div class="identity-reference">
		<p
			v-if="help"
			class="text-muted"
		>
			{{ help }}
		</p>
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<div
			v-if="loading"
			class="ocs-loader"
		>
			<Loader />
		</div>
		<template v-else>
			<div class="d-flex mb-3 gap-2">
				<b-form-input
					v-model="search"
					type="search"
					:placeholder="$t('generic.search')"
					class="w-auto"
				/>
				<b-button
					v-if="cancreate"
					variant="primary"
					class="ms-auto"
					@click="openForm(null)"
				>
					<font-awesome-icon
						:icon="['fas', 'plus']"
						class="me-1"
					/>
					{{ $t('generic.add') }}
				</b-button>
			</div>
			<p v-if="!filteredRows.length">
				{{ $t('generic.no_data') }}
			</p>
			<div
				v-else
				class="table-responsive"
			>
				<table class="table table-sm table-striped table-vcenter">
					<thead>
						<tr>
							<th
								v-for="field in columns"
								:key="field"
							>
								{{ fieldLabel(field) }}
							</th>
							<th v-if="canedit || candelete" />
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="row in pagedRows"
							:key="row.id"
						>
							<td
								v-for="field in columns"
								:key="field"
							>
								<template v-if="fieldType(field) === 'boolean'">
									<span
										v-if="row[field]"
										class="badge"
										:class="badgefields[field] || 'bg-green-lt'"
									>{{ booleanLabel(field) }}</span>
									<span
										v-else
										class="text-muted"
									>—</span>
								</template>
								<template v-else-if="field === 'source' && (row[field] === 'shipped' || row[field] === 'admin')">
									{{ $t('software_identity.source_' + row[field]) }}
								</template>
								<template v-else-if="fieldType(field) === 'date'">
									{{ row[field] ? formatDay(row[field]) : '—' }}
								</template>
								<template v-else-if="fieldType(field) === 'datetime'">
									{{ formatDateTime(row[field]) }}
								</template>
								<template v-else>
									{{ display(row[field]) }}
								</template>
							</td>
							<td
								v-if="canedit || candelete"
								class="text-nowrap"
							>
								<div class="d-flex">
									<button
										v-if="canedit && editableFields.length && !isprotected(row)"
										class="btn btn-ghost-dark"
										:title="$t('generic.update')"
										@click="openForm(row)"
									>
										<font-awesome-icon :icon="['fas', 'pencil']" />
									</button>
									<DeleteItemModal
										v-if="candelete && !isprotected(row)"
										:id="row.id"
										:name="String(row[columns[0]] ?? row.id)"
										:parameter="route"
										@reload-datatable="load"
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<b-pagination
				v-if="filteredRows.length > perPage"
				v-model="currentPage"
				:total-rows="filteredRows.length"
				:per-page="perPage"
				align="right"
				size="sm"
			/>
		</template>

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
					:description="fieldhelp[field] || meta[field]?.help_text || ''"
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
		help: { type: String, default: "" },
		// columns shown first, in this order
		firstfields: { type: Array, default: () => [] },
		// labels of a true boolean, by field
		booleanlabels: { type: Object, default: () => ({}) },
		badgefields: { type: Object, default: () => ({}) },
		fieldhelp: { type: Object, default: () => ({}) },
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
			rows: [],
			meta: {},
			hasPost: false,
			search: "",
			currentPage: 1,
			perPage: 25,

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
		filteredRows() {
			const search = this.search.toLowerCase()
			if (!search) return this.rows
			return this.rows.filter((row) =>
				this.columns.some((field) => String(row[field] ?? "").toLowerCase().includes(search))
			)
		},
		pagedRows() {
			const start = (this.currentPage - 1) * this.perPage
			return this.filteredRows.slice(start, start + this.perPage)
		},
	},
	watch: {
		search() {
			this.currentPage = 1
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
			}
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
			if (value === null || value === undefined || value === "") return "—"
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
