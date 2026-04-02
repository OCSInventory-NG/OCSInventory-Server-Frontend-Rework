<template>
	<div id="search">
		<SaveSearchModal 
			v-if="cansave && !disableforgroup"
			:rowsearch="datavalues"
			@use-save-search="useSaveSearch"
		/>
		<b-form
			@submit="onSubmit"
		>
			<div
				v-for="(masterinput, masterindex) in datavalues"
				:key="masterindex"
				class="modal-allactions multisearch-card"
			>
				<div
					v-if="!disableforgroup"
					v-show="datavalues.length > 1"
					align="right"
				>
					<b-button 
						size="sm"
						variant="outline-danger"
						:title="$t('search.removegroup')"
						@click="removeGroup(masterindex, datavalues)"
					>
						<font-awesome-icon 
							:icon="['fas', 'xmark']"
							size="1x"
						/>
					</b-button>
				</div>
				
				<div
					v-for="(input, index) in masterinput"
					:key="`valueInput-${index}`"
					class="modal-allactions"
				>
					<b-row>
						<b-col
							v-if="index > 0 || masterindex > 0"
							cols="1"
						>
							<b-form-group>
								<v-select
									:id="'link'+masterindex+index"
									v-model="datavalues[masterindex][index].link" 
									:options="linkopt" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:disabled="disableforgroup"
								/>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group>
								<v-select
									:id="'route'+masterindex+index"
									v-model="input.route" 
									:options="routeopt" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:disabled="disableforgroup"
									@option:selected="getFields(input.route, masterindex, index)"
								/>
							</b-form-group>
						</b-col>
						<b-col v-if="input.object == 'inventory_sections'">
							<v-select
								:id="'template'+masterindex+index"
								v-model="input.template" 
								:options="(loadingtemplate || templateopt[masterindex] == undefined) ? 
									[] : templateopt[masterindex][index]" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
								:disabled="disableforgroup"
								:loading="loadingtemplate"
								@option:selected="getSections(input.template, masterindex, index)"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										:required="!input.template"
										v-bind="attributes"
										v-on="events"
									>
								</template>
							</v-select>
						</b-col>
						<b-col v-if="input.object == 'inventory_sections'">
							<v-select
								:id="'section'+masterindex+index"
								v-model="input.section" 
								:options="(loadingsection || sectionopt[masterindex] == undefined) ? 
									[] : sectionopt[masterindex][index]" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
								:disabled="disableforgroup"
								:loading="loadingsection"
								@option:selected="getFields(input.section, masterindex, index, true)"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										:required="!input.section"
										v-bind="attributes"
										v-on="events"
									>
								</template>
							</v-select>
						</b-col>
						<b-col>
							<b-form-group>
								<v-select
									:id="'field'+masterindex+index"
									v-model="input.field" 
									:options="(fieldopt[masterindex]) ? 
										fieldopt[masterindex][index] : []" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:disabled="disableforgroup"
									:loading="loading"
									@option:selected="setFieldType(input, masterindex, index)"
								>
									<template #search="{attributes, events}">
										<input
											class="vs__search"
											:required="!input.field"
											v-bind="attributes"
											v-on="events"
										>
									</template>
								</v-select>
							</b-form-group>
						</b-col>
						<b-col cols="2">
							<b-form-group>
								<v-select
									:id="'operator'+masterindex+index"
									v-model="input.operator" 
									:options="operatoropt[input.fieldtype]" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:disabled="disableforgroup"
								>
									<template #search="{attributes, events}">
										<input
											class="vs__search"
											:required="!input.operator"
											v-bind="attributes"
											v-on="events"
										>
									</template>
								</v-select>
							</b-form-group>
						</b-col>
						<b-col cols="3">
							<b-form-group>
								<b-form-input
									v-if="!selectfield.includes(input.fieldtype)"
									:id="'value'+masterindex+index"
									v-model="input.value"
									:type="inputype[input.fieldtype]"
									class="mb-3"
									:disabled="disableforgroup"
								/>
								<div v-else>
									<v-select
										:id="'value'+masterindex+index"
										v-model="input.value" 
										:options="(input.fieldtype == 'choice') ?
											scope : (adminopt[masterindex]) ?
												adminopt[masterindex][index] : []" 
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:loading="loadingadmin"
										:disabled="disableforgroup"
									>
										<template #search="{attributes, events}">
											<input
												class="vs__search"
												:required="!input.value"
												v-bind="attributes"
												v-on="events"
											>
										</template>
									</v-select>
								</div>
							</b-form-group>
						</b-col>
						<b-col 
							v-if="!disableforgroup"
							cols="1"
						>
							<b-form-group>
								<b-button 
									:id="'addfield'+masterindex+index"
									v-b-modal="1"
									variant="primary"
									class="d-none d-sm-inline-block form-control"
									:title="$t('search.addquerytogroup')"
									@click="addField(masterindex, index, datavalues)"
								>
									<font-awesome-icon 
										:icon="['fas', 'plus']"
									/>
								</b-button>
							</b-form-group>
						</b-col>
						<b-col 
							v-if="!disableforgroup"
							v-show="datavalues[masterindex].length > 1"
							cols="1"
						>
							<b-form-group>
								<b-button 
									:id="'removefield'+masterindex+index"
									v-b-modal="1"
									variant="danger"
									class="d-none d-sm-inline-block form-control"
									:title="$t('search.removequeryfromgroup')"
									@click="removeField(masterindex, index, datavalues)"
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
			<b-row v-if="!disableforgroup">
				<b-col align-self="start" />
				<b-col 
					align-self="center"
					align="center"
					class="multisearch-btns"
				>
					<div class="mb-2">
						<b-button
							type="button"
							variant="info"
							class="multisearch-btn"
							@click="addGroup(datavalues)"
						>
							{{ $t('search.addgroup') }}
						</b-button>
						<b-button
							type="submit"
							variant="success"
						>
							{{ $t('generic.search') }}
						</b-button>
					</div>
					<b-form-checkbox
						v-model="ungroup"
						inline
					>
						{{ $t('search.ungroup') }}
					</b-form-checkbox>
				</b-col>
				<b-col align-self="end" />
			</b-row>
		</b-form>
	</div>
</template>

<script>
export default {
	name: 'Search',
	props: {
		searchgroup: { type: [Array, Object], default: () => [] },
		disableforgroup: { type: Boolean, default: false }
	},
	data() {
		return {
			errored: false,
			ungroup: false,

			errormsg: null,
			successmsg: null,
			successed: false,

			cansave: false,

			datavalues: [
				[
					{
						object: "InventoryBase",
						route: "asset/bases",
						field: "",
						fieldtype: "string",
						operator: "iexact",
						value: "",
						link: ""
					}
				]
			],
			routeopt: [],
			obj: {
				"asset/bases": "InventoryBase",
				"accountinfo/config?datatarget=ASSET": "AccountinfoConfig",
				"deployment/results": "results",
				"asset/logs": "logs",
				"templates": "inventory_sections",
				"snmp/scanner": "snmpscanner",
				"software_dictionary": "software_dictionary_entries",
			},
			fieldopt: [],
			operatoropt: {},
			linktype: {
				"TEXT": "string",
				"TEXTAREA": "string",
				"SELECT": "select",
				"CHECKBOX": "checkbox"
			},
			linkopt: [],
			adminopt: [],
			templateopt: [],
			sectionopt: [],
			inputype: {
				"string": "text",
				"integer": "number",
				"datetime": "datetime-local"
			},
			selectfield: ["select", "checkbox", "choice"],
			excludefield: ["id", "asset", "package"],
			scope: [],

			loading: true,
			loadingadmin: true,
			loadingtemplate: true,
			loadingsection: true,
		}
	},
	watch: {
		'$i18n.locale'() {
			this.updateTranslations()
		}
	},
	mounted() {
		const rawPermissions = localStorage.getItem("permissions")
		const permissions = rawPermissions ? rawPermissions.split(",") : []
		this.cansave = permissions.includes("search_add_search")

		this.datavalues =
			JSON.parse(localStorage.getItem("multisearch")) ?? [
				[
					{
						object: "InventoryBase",
						route: "asset/bases",
						field: "",
						fieldtype: "string",
						operator: "iexact",
						value: "",
						link: "",
					},
				],
			]

		if (this.searchgroup.length) {
			this.datavalues = this.searchgroup
		}
		this.loadFieldsAndUpdateTranslations()
	},

	methods: {
		async loadFieldsAndUpdateTranslations() {
			const promises = []
			
			Object.keys(this.datavalues).forEach((masterindex) => {
				Object.keys(this.datavalues[masterindex]).forEach((index) => {
					const row = this.datavalues[masterindex][index]
					promises.push(this.getFields(row.route, masterindex, index, false, true))

					if (
						row.route === "templates" &&
						row.template != null &&
						row.section != null
					) {
						promises.push(this.getSections(row.template, masterindex, index, true))
						promises.push(this.getFields(row.section, masterindex, index, true, true))
					}
				})
			})
			await Promise.all(promises)
			Object.keys(this.datavalues).forEach((masterindex) => {
				Object.keys(this.datavalues[masterindex]).forEach((index) => {
					const row = this.datavalues[masterindex][index]
					this.setFieldType(row, masterindex, index)
				})
			})
			this.updateTranslations()
		},
		updateTranslations() {
			this.routeopt = [
				{ value: "asset/bases", text: this.$t("title.assets") },
				{ value: "accountinfo/config?datatarget=ASSET", text: this.$t("title.accountinfo") },
				{ value: "deployment/results", text: this.$t("title.deployment") },
				{ value: "asset/logs", text: this.$t("title.inventory_logs") },
				{ value: "templates", text: this.$t("title.inventory") },
				{ value: "snmp/scanner", text: this.$t("network.snmpscanner") },
				{ value: "software_dictionary", text: this.$t("title.software_dictionary") },
			]
			this.routeopt.sort((a, b) => (a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)))

			this.operatoropt = {
				"string": [
					{ value: "iexact", text: this.$t("search.iexact") },
					{ value: "icontains", text: this.$t("search.icontains") },
					{ value: "istartswith", text: this.$t("search.istartswith") },
					{ value: "iendswith", text: this.$t("search.iendswith") },
				],
				"integer": [
					{ value: "iexact", text: this.$t("search.iexact") },
					{ value: "gt", text: this.$t("search.gt") },
					{ value: "gte", text: this.$t("search.gte") },
					{ value: "lt", text: this.$t("search.lt") },
					{ value: "lte", text: this.$t("search.lte") }
				],
				"datetime": [
					{ value: "iexact", text: this.$t("search.iexact") },
					{ value: "gt", text: this.$t("search.gt") },
					{ value: "gte", text: this.$t("search.gte") },
					{ value: "lt", text: this.$t("search.lt") },
					{ value: "lte", text: this.$t("search.lte") }
				],
				"select": [
					{ value: "iexact", text: this.$t("search.iexact") },
				],
				"checkbox": [
					{ value: "iexact", text: this.$t("search.iexact") },
				],
				"choice": [
					{ value: "iexact", text: this.$t("search.iexact") },
				]
			}

			this.linkopt = [
				{ value: "AND", text: this.$t("search.and") },
				{ value: "OR", text: this.$t("search.or") }
			]

			Object.keys(this.datavalues).forEach((masterindex) => {
				Object.keys(this.datavalues[masterindex]).forEach((index) => {
					const row = this.datavalues[masterindex][index]
					if (row.route && this.fieldopt?.[masterindex]?.[index]?.length > 0) {
						this.retranslateFieldsForRoute(row.route, masterindex, index)
					}
				})
			})
		},

		retranslateFieldsForRoute(route, masterindex, index) {
			const component = this.resolveComponentFromRoute(route)
			
			if (route === "accountinfo/config?datatarget=ASSET" || route === "templates") {
				return
			}
			
			if (this.fieldopt?.[masterindex]?.[index]) {
				const retranslatedFields = this.fieldopt[masterindex][index].map((field) => ({
					...field,
					text: this.$t(`${component}.${field.value}`)
				}))
				retranslatedFields.sort(this.sortByText)
				this.fieldopt[masterindex][index] = retranslatedFields
			}
		},

		ensureNestedArray(container, masterindex) {
			if (!Array.isArray(container[masterindex])) container[masterindex] = []
		},

		sortByText(a, b) {
			return a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)
		},

		resetSearchRow(masterindex, index) {
			const row = this.datavalues[masterindex][index]
			row.field = ""
			row.value = ""
			row.operator = "iexact"
			row.fieldtype = "string"
		},

		cleanupTemplateSection(masterindex, index) {
			delete this.datavalues[masterindex][index].template
			delete this.datavalues[masterindex][index].section
		},

		resolveComponentFromRoute(route) {
			let component = route.split("/")[0]
			if (component === "asset") component = "inventory"
			if (component === "snmp") component = "network"
			if (component === "software_dictionary") component = "software"
			return component
		},

		setObjectFromRoute(route, masterindex, index) {
			this.datavalues[masterindex][index].object = this.obj[route]
		},

		onSubmit(event) {
			event.preventDefault()
			localStorage.setItem("multisearch", JSON.stringify(this.datavalues))
			this.$emit("reloadDatatable", {
				search_data: this.datavalues,
				ungroup: this.ungroup
			})
		},

		async getFields(route, masterindex, index, section = false, loadingdata = false) {
			try {
				if (!loadingdata) this.resetSearchRow(masterindex, index)

				let component = null
				if (!section) {
					component = this.resolveComponentFromRoute(route)
					this.setObjectFromRoute(route, masterindex, index)
				}

				this.ensureNestedArray(this.fieldopt, masterindex)
				this.fieldopt[masterindex][index] = []

				if (route === "accountinfo/config?datatarget=ASSET") {
					await this.handleAccountinfoConfigFields(masterindex, index)
					return
				}

				if (route === "templates") {
					await this.handleTemplatesFields(masterindex, index)
					return
				}

				if (section) {
					await this.handleSectionFields(route, masterindex, index)
					return
				}

				await this.handleOptionsFields(route, component, masterindex, index)

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e
				this.errored = true
			} finally {
				this.loading = false
				this.loadingtemplate = false
			}
		},

		async handleAccountinfoConfigFields(masterindex, index) {
			this.loading = true
			this.ensureNestedArray(this.fieldopt, masterindex)
			this.fieldopt[masterindex][index] = []

			this.cleanupTemplateSection(masterindex, index)

			const data = await this.$api.generic.get(
				"accountinfo/config/",
				{},
				{ expand: "accountinfo_values", datatarget: "ASSET" }
			)
			const rows = Array.isArray(data) ? data : (data?.results || [])

			this.fieldopt[masterindex][index] = rows
				.map((field) => ({
					value: field.id,
					text: field.name,
					fieldtype: this.linktype[field.datatype],
				}))
				.sort(this.sortByText)

			this.loading = false
		},

		async handleTemplatesFields(masterindex, index) {
			this.loadingtemplate = true

			this.ensureNestedArray(this.templateopt, masterindex)
			this.templateopt[masterindex][index] = []

			const data = await this.$api.generic.get("templates/")
			const rows = Array.isArray(data) ? data : (data?.results || [])

			this.templateopt[masterindex][index] = rows
				.map((t) => ({ value: t.id, text: t.name }))
				.sort(this.sortByText)

			this.loadingtemplate = false
		},

		async handleSectionFields(sectionId, masterindex, index) {
			this.loading = true

			this.ensureNestedArray(this.fieldopt, masterindex)
			this.fieldopt[masterindex][index] = []

			const data = await this.$api.generic.get(
				"fields/",
				{},
				{ section: sectionId }
			)
			const rows = Array.isArray(data) ? data : (data?.results || [])

			this.fieldopt[masterindex][index] = rows
				.map((f) => ({ value: f.id, text: f.name, fieldtype: "string" }))
				.sort(this.sortByText)

			this.loading = false
		},

		async handleOptionsFields(route, component, masterindex, index) {
			this.loading = true

			this.ensureNestedArray(this.fieldopt, masterindex)
			this.fieldopt[masterindex][index] = []

			this.cleanupTemplateSection(masterindex, index)

			const opts = await this.$api.generic.options(`${route}/`)
			const post = opts?.actions?.POST || {}

			Object.keys(post).forEach((field) => {
				const def = post[field]
				if (this.excludefield.includes(field)) return
				if (def?.type === "field") return

				this.fieldopt[masterindex][index].push({
					value: field,
					text: this.$t(`${component}.${field}`),
					fieldtype: def?.type,
				})

				if (def?.type === "choice") {
					this.scope = (def.choices || [])
						.map((c) => ({ value: c.value, text: this.$t("inventory." + c.value) }))
						.sort(this.sortByText)

					this.loadingadmin = false
				}
			})

			this.fieldopt[masterindex][index].sort(this.sortByText)
			this.loading = false
		},

		async getSections(templateId, masterindex, index, loadingdata = false) {
			try {
				this.loadingsection = true

				const data = await this.$api.generic.get("sections/", {}, { template: templateId })
				const rows = Array.isArray(data) ? data : (data?.results || [])

				this.ensureNestedArray(this.sectionopt, masterindex)
				this.sectionopt[masterindex][index] = rows
					.map((s) => ({ value: s.id, text: s.name }))
					.sort(this.sortByText)

				if (!loadingdata) {
					this.datavalues[masterindex][index].section = null
					this.datavalues[masterindex][index].field = ""
				}
			} catch (e) {
				this.errormsg = e
				this.errored = true
			} finally {
				this.loadingsection = false
			}
		},

		addField(masterindex, index, fieldType) {
			fieldType[masterindex].push(
				{
					object: "InventoryBase",
					route: "asset/bases",
					field: "",
					fieldtype: "string",
					operator: "iexact",
					value: "",
					link: "AND"
				}
			)
			this.getFields("asset/bases", masterindex, index+1)
		},

		removeField(masterindex, index, fieldType) {
			fieldType[masterindex].splice(index, 1)
			this.fieldopt[masterindex].splice(index, 1)
		},

		addGroup(fieldType) {
			var masterindex = fieldType.length
			fieldType[masterindex] = []

			fieldType[masterindex].push(
				{
					object: "InventoryBase",
					route: "asset/bases",
					field: "",
					fieldtype: "string",
					operator: "iexact",
					value: "",
					link: "AND"
				}
			)

			this.datavalues = JSON.parse(JSON.stringify(fieldType))
			this.getFields("asset/bases", masterindex, 0)
		},

		removeGroup(masterindex, fieldType) {
			fieldType.splice(masterindex, 1)
			this.fieldopt.splice(masterindex, 1)
		},

		async setFieldType(input, masterindex, index) {
			for (const element of this.fieldopt?.[masterindex]?.[index] || []) {
				if (element.value == input.field) {
					input.fieldtype = element.fieldtype
					break
				}
			}

			if (input.fieldtype === "select" || input.fieldtype === "checkbox") {
				try {
					this.loadingadmin = true

					const data = await this.$api.generic.get(
						"accountinfo/value",
						{},
						{ accountinfo_config: input.field }
					)

					const rows = Array.isArray(data) ? data : (data?.results || [])

					this.ensureNestedArray(this.adminopt, masterindex)
					this.adminopt[masterindex][index] = rows.map((el) => ({
						value: el.id,
						text: el.value,
					}))
				} catch (e) {
					this.errormsg = e
					this.errored = true
				} finally {
					this.loadingadmin = false
				}
			}
		},

		useSaveSearch(search) {
			this.datavalues = JSON.parse(JSON.stringify(search))

			Object.keys(this.datavalues).forEach((masterindex) => {
				Object.keys(this.datavalues[masterindex]).forEach((index) => {
					const row = this.datavalues[masterindex][index]

					this.getFields(row.route, masterindex, index, false, true)

					if (
						row.route === "templates" &&
						row.template != null &&
						row.section != null
					) {
						this.getSections(row.template, masterindex, index, true)
						this.getFields(row.section, masterindex, index, true, true)
					}

					this.setFieldType(row, masterindex, index)
				})
			})

			localStorage.setItem("multisearch", JSON.stringify(this.datavalues))
			this.$emit("reloadDatatable", {
				search_data: this.datavalues,
				ungroup: this.ungroup
			})
		},
	}
}
</script>