<template>
	<div id="search">
		<AddSaveSearchModal 
			v-if="cansave && !disableforgroup"
			:rowsearch="datavalues"
			@useSaveSearch="useSaveSearch"
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
								<b-form-select
									:id="'link'+masterindex+index"
									v-model="datavalues[masterindex][index].link"
									:options="linkopt"
									class="mb-3 form-select form-control"
									:required="true"
									:disabled="disableforgroup"
								/>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group>
								<b-form-select
									:id="'route'+masterindex+index"
									v-model="input.route" 
									:options="routeopt" 
									class="mb-3 form-select form-control"
									:required="true"
									:disabled="disableforgroup"
									@input="getFields(input.route, masterindex, index)"
								/>
							</b-form-group>
						</b-col>
						<b-col v-if="input.object == 'inventory_sections'">
							<b-form-select
								:id="'template'+masterindex+index"
								v-model="input.template" 
								:options="(loadingtemplate || templateopt[masterindex] == undefined) ? 
									[] : templateopt[masterindex][index]" 
								class="mb-3 form-select form-control"
								:required="true"
								:disabled="(loadingtemplate || disableforgroup) ? true : false"
								@input="getSections(input.template, masterindex, index)"
							/>
						</b-col>
						<b-col v-if="input.object == 'inventory_sections'">
							<b-form-select
								:id="'section'+masterindex+index"
								v-model="input.section" 
								:options="(loadingsection || sectionopt[masterindex] == undefined) ? 
									[] : sectionopt[masterindex][index]" 
								class="mb-3 form-select form-control"
								:required="true"
								:disabled="(loadingsection || disableforgroup) ? true : false"
								@input="getFields(input.section, masterindex, index, true)"
							/>
						</b-col>
						<b-col>
							<b-form-group>
								<b-form-select
									v-if="loading"
									:id="'field'+masterindex+index"
									v-model="input.field"
									class="mb-3 form-select form-control"
									:disabled="true"
								/>
								<b-form-select
									v-else
									:id="'field'+masterindex+index"
									v-model="input.field" 
									:options="fieldopt[masterindex][index]" 
									class="mb-3 form-select form-control"
									:required="true"
									:disabled="disableforgroup"
									@input="setFieldType(input, masterindex, index)"
								/>
							</b-form-group>
						</b-col>
						<b-col cols="2">
							<b-form-group>
								<b-form-select
									:id="'operator'+masterindex+index"
									v-model="input.operator"
									:options="operatoropt[input.fieldtype]"
									class="mb-3 form-select form-control"
									:required="true"
									:disabled="disableforgroup"
								/>
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
									<b-form-select
										v-if="loadingadmin"
										:id="'field'+masterindex+index"
										v-model="input.value"
										class="mb-3 form-select form-control"
										:disabled="true"
									/>
									<b-form-select
										v-else
										:id="'value'+masterindex+index"
										v-model="input.value"
										:options="(input.fieldtype == 'choice') ?
											scope : adminopt[masterindex][index]"
										class="mb-3 form-select form-control"
										:required="true"
										:disabled="disableforgroup"
									/>
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
				</b-col>
				<b-col align-self="end" />
			</b-row>
		</b-form>
	</div>
</template>

<script>
import Axios from 'axios'
import AddSaveSearchModal from '@/components/Modals/AddItem/AddSaveSearchModal.vue'

export default {
	name: 'Search',
	components: { AddSaveSearchModal },
	props: {
		searchgroup: { type: Array, default: null },
		disableforgroup: { type: Boolean, default: false }
	},
	data() {
		return {
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			loading: true,
			loadingadmin: true,
			loadingtemplate: true,
			loadingsection: true,
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
			routeopt: [
				{ value: "asset/bases", text: this.$t("title.assets") },
				{ value: "accountinfo/config?datatarget=ASSET", text: this.$t("title.accountinfo") },
				{ value: "deployment/results", text: this.$t("title.deployment") },
				{ value: "asset/logs", text: this.$t("title.inventory_logs") },
				{ value: "templates", text: this.$t("title.inventory") },
			],
			obj: {
				"asset/bases": "InventoryBase",
				"accountinfo/config?datatarget=ASSET": "AccountinfoConfig",
				"deployment/results": "results",
				"asset/logs": "logs",
				"templates": "inventory_sections"
			},
			fieldopt: [],
			operatoropt: {
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
			},
			linktype: {
				"TEXT": "string",
				"TEXTAREA": "string",
				"SELECT": "select",
				"CHECKBOX": "checkbox"
			},
			linkopt: [
				{ value: "AND", text: this.$t("search.and") },
				{ value: "OR", text: this.$t("search.or") }
			],
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			cansave: false
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("add_search")) {
			this.cansave = true
		}

		this.routeopt.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))

		this.datavalues = JSON.parse(localStorage.getItem('multisearch')) ?? [
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
		]

		if(this.searchgroup) {
			this.datavalues = this.searchgroup
		}

		Object.keys(this.datavalues).forEach(index => {
			Object.keys(this.datavalues[index]).forEach(search => {
				this.getFields(this.datavalues[index][search].route, index, search)
				if(
					this.datavalues[index][search].route == "templates"
					&& this.datavalues[index][search].template != null
					&& this.datavalues[index][search].section != null
				) {
					this.getSections(this.datavalues[index][search].template, index, search)
					this.getFields(this.datavalues[index][search].section, index, search, true)
				}
				this.setFieldType(this.datavalues[index][search], index, search)
			})
		})
	},
	methods: {
		// Submit dynamic datas
		onSubmit(event) {
			event.preventDefault()

			// Save param in local storage
			localStorage.setItem('multisearch', JSON.stringify(this.datavalues))

			this.$emit('reloadDatatable', this.datavalues)
		},
		getFields(route, masterindex, index, section = false) {

			if(!section) {
				var component = route.split("/")[0]

				if(component == "asset") {
					component = "inventory"
				}

				this.datavalues[masterindex][index].object = this.obj[route]
			}

			if(!Array.isArray(this.fieldopt[masterindex])) {
				this.fieldopt[masterindex] = []
			}

			this.fieldopt[masterindex][index] = []

			if(route == "accountinfo/config?datatarget=ASSET") {
				Axios.get(import.meta.env.VITE_APP_API_ROUTE+route, { headers: this.header })
					.then(response => {
						this.loading = true
						this.fieldopt[masterindex][index] = []

						delete this.datavalues[masterindex][index].template
						delete this.datavalues[masterindex][index].section

						response.data.forEach(field => {
							this.fieldopt[masterindex][index].push({
								value: field.id,
								text: field.name,
								fieldtype: this.linktype[field.datatype]
							})
						})

						this.fieldopt[masterindex][index].sort((a,b) => (a.text > b.text) ?
							1 : ((b.text > a.text) ? -1 : 0))
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
					})
					.finally(() => this.loading = false)
			} else if(route == "templates") {
				Axios.get(import.meta.env.VITE_APP_API_ROUTE+route, { headers: this.header })
					.then(response => {
						this.loadingtemplate = true
						if(!Array.isArray(this.templateopt[masterindex])) {
							this.templateopt[masterindex] = []
						}

						this.templateopt[masterindex][index] = []

						response.data.forEach(field => {
							this.templateopt[masterindex][index].push({
								value: field.id,
								text: field.name
							})
						})

						this.templateopt[masterindex][index].sort((a,b) => (a.text > b.text) ?
							1 : ((b.text > a.text) ? -1 : 0))

						this.loadingtemplate = false
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
					})
			} else if (section) {
				Axios.get(import.meta.env.VITE_APP_API_ROUTE+"fields?section="+route, { headers: this.header })
					.then(response => {
						this.loading = true

						this.fieldopt[masterindex][index] = []

						response.data.forEach(field => {
							this.fieldopt[masterindex][index].push({
								value: field.id,
								text: field.name,
								fieldtype: "string"
							})
						})

						this.fieldopt[masterindex][index].sort((a,b) => (a.text > b.text) ?
							1 : ((b.text > a.text) ? -1 : 0))
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
					})
					.finally(() => this.loading = false)
			} else {
				Axios.options(import.meta.env.VITE_APP_API_ROUTE+route+"/", { headers: this.header })
					.then(response => {
						this.loading = true

						this.fieldopt[masterindex][index] = []

						delete this.datavalues[masterindex][index].template
						delete this.datavalues[masterindex][index].section

						Object.keys(response.data.actions.POST).forEach(field => {
							if(!this.excludefield.includes(field) &&
								response.data.actions.POST[field]["type"] != "field") {
								this.fieldopt[masterindex][index].push({
									value: field,
									text: this.$t(component+"."+field),
									fieldtype: response.data.actions.POST[field]["type"]
								})
								if(response.data.actions.POST[field]["type"] == "choice") {
									this.scope = []
									response.data.actions.POST[field]["choices"].forEach(choice => {
										this.scope.push({
											value: choice.value,
											text: this.$t("inventory."+choice.value)
										})
									})

									this.scope.sort((a,b) => (a.text > b.text) ?
										1 : ((b.text > a.text) ? -1 : 0))

									this.loadingadmin = false
								}
							}
						})

						this.fieldopt[masterindex][index].sort((a,b) => (a.text > b.text) ?
							1 : ((b.text > a.text) ? -1 : 0))

						this.errorMsg = null
						this.errored = false
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
					})
					.finally(() => this.loading = false)
			}
			
		},
		getSections(templateId, masterindex, index) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"sections?template="+templateId, { headers: this.header })
				.then(response => {
					this.loadingsection = true
					if(!Array.isArray(this.sectionopt[masterindex])) {
						this.sectionopt[masterindex] = []
					}

					this.sectionopt[masterindex][index] = []

					response.data.forEach(field => {
						this.sectionopt[masterindex][index].push({
							value: field.id,
							text: field.name
						})
					})

					this.sectionopt[masterindex][index].sort((a,b) => (a.text > b.text) ?
						1 : ((b.text > a.text) ? -1 : 0))
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loadingsection = false)
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
		setFieldType(input, masterindex, index) {
			this.fieldopt[masterindex][index].forEach(element => {
				if(element.value == input.field) {
					input.fieldtype = element.fieldtype
				}
			})

			if(input.fieldtype == "select" || input.fieldtype == "checkbox") {
				Axios.get(import.meta.env.VITE_APP_API_ROUTE+"accountinfo/value?accountinfo_config="+input.field, 
					{ headers: this.header })
					.then(response => {
						this.loadingadmin = true

						if(!Array.isArray(this.adminopt[masterindex])) {
							this.adminopt[masterindex] = []
						}

						this.adminopt[masterindex][index] = []

						response.data.forEach(element => {
							this.adminopt[masterindex][index].push({
								value: element.id,
								text: element.value
							})
						})

						this.loadingadmin = false
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
					})
			}
		},
		useSaveSearch(search) {
			this.datavalues = JSON.parse(JSON.stringify(search))

			Object.keys(this.datavalues).forEach(index => {
				Object.keys(this.datavalues[index]).forEach(search => {
					this.getFields(this.datavalues[index][search].route, index, search)
					if(
						this.datavalues[index][search].route == "templates"
						&& this.datavalues[index][search].template != null
						&& this.datavalues[index][search].section != null
					) {
						this.getSections(this.datavalues[index][search].template, index, search)
						this.getFields(this.datavalues[index][search].section, index, search, true)
					}
					this.setFieldType(this.datavalues[index][search], index, search)
				})
			})

			// Save param in local storage
			localStorage.setItem('multisearch', JSON.stringify(this.datavalues))

			this.$emit('reloadDatatable', this.datavalues)
		}
	}
}
</script>