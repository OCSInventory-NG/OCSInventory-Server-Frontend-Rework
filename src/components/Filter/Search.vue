<template>
	<div id="search">
		<b-form
			@submit="onSubmit"
		>
			<div
				v-for="(masterinput, masterindex) in datavalues"
				:key="masterindex"
				class="modal-allactions multisearch-card"
			>
				<div
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
									@input="getFields(input.route, masterindex, index)"
								/>
							</b-form-group>
						</b-col>
						<b-col v-if="!loading">
							<b-form-group>
								<b-form-select
									:id="'field'+masterindex+index"
									v-model="input.field" 
									:options="fieldopt[masterindex][index]" 
									class="mb-3 form-select form-control"
									@input="setFieldType(input, masterindex, index)"
								/>
							</b-form-group>
						</b-col>
						<b-col v-else>
							<b-form-group>
								<b-form-select
									:id="'field'+masterindex+index"
									v-model="input.field"
									class="mb-3 form-select form-control"
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
								/>
							</b-form-group>
						</b-col>
						<b-col cols="3">
							<b-form-group>
								<b-form-input
									v-if="input.fieldtype != 'dropdown'"
									:id="'value'+masterindex+index"
									v-model="input.value"
									:type="inputype[input.fieldtype]"
									class="mb-3"
								/>
								<b-form-select
									v-else
									:id="'value'+masterindex+index"
									v-model="input.value"
									:options="adminopt" 
									class="mb-3 form-select form-control"
								/>
							</b-form-group>
						</b-col>
						<b-col cols="1">
							<b-form-group>
								<b-button 
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
							v-show="datavalues[masterindex].length > 1"
							cols="1"
						>
							<b-form-group>
								<b-button 
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
import i18n from '../../i18n'

export default {
	name: 'Search',
	data() {
		return {
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			loading: true,
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
				{ value: "asset/bases", text: i18n.t("title.assets") },
				//{ value: "accountinfo/config?datatarget=ASSET", text: i18n.t("title.accountinfo") },
				{ value: "deployment/results", text: i18n.t("title.deployment") },
			],
			obj: {
				"asset/bases": "InventoryBase",
				//"accountinfo/config?datatarget=ASSET": "AccountinfoConfig",
				"deployment/results": "asset"
			},
			fieldopt: [],
			operatoropt: {
				"string": [
					{ value: "iexact", text: i18n.t("search.iexact") },
					{ value: "icontains", text: i18n.t("search.icontains") },
					{ value: "istartswith", text: i18n.t("search.istartswith") },
					{ value: "iendswith", text: i18n.t("search.iendswith") },
				],
				"integer": [
					{ value: "iexact", text: i18n.t("search.iexact") },
					{ value: "gt", text: i18n.t("search.gt") },
					{ value: "gte", text: i18n.t("search.gte") },
					{ value: "lt", text: i18n.t("search.lt") },
					{ value: "lte", text: i18n.t("search.lte") }
				],
				"datetime": [
					{ value: "iexact", text: i18n.t("search.iexact") },
					{ value: "gt", text: i18n.t("search.gt") },
					{ value: "gte", text: i18n.t("search.gte") },
					{ value: "lt", text: i18n.t("search.lt") },
					{ value: "lte", text: i18n.t("search.lte") }
				],
				"dropdown": [
					{ value: "iexact", text: i18n.t("search.iexact") },
				]
			},
			linktype: {
				"TEXT": "string",
				"TEXTAREA": "string",
				"SELECT": "dropdown",
				"CHECKBOX": "dropdown"
			},
			linkopt: [
				{ value: "AND", text: i18n.t("search.and") },
				{ value: "OR", text: i18n.t("search.or") }
			],
			adminopt: [],
			inputype: {
				"string": "text",
				"integer": "number",
				"datetime": "datetime-local"
			},
			excludefield: ["id", "asset", "package"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
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

		Object.keys(this.datavalues).forEach(index => {
			Object.keys(this.datavalues[index]).forEach(search => {
				this.getFields(this.datavalues[index][search].route, index, search)
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
		getFields(route, masterindex, index) {
			var component = route.split("/")[0]

			if(!Array.isArray(this.fieldopt[masterindex])) {
				this.fieldopt[masterindex] = []
			}

			this.fieldopt[masterindex][index] = []

			this.fieldopt[masterindex][index].push({
				value: "",
				text: "----",
				fieldtype: "string",
				disabled: true
			})

			if(component == "asset") {
				component = "inventory"
			}

			this.datavalues[masterindex][index].object = this.obj[route]

			if(route == "accountinfo/config?datatarget=ASSET") {
				Axios.get(process.env.VUE_APP_API_ROUTE+route, { headers: this.header })
					.then(response => {
						response.data.forEach(field => {
							this.fieldopt[masterindex][index].push({
								value: field.id,
								text: field.name,
								fieldtype: this.linktype[field.datatype]
							})
						})
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
					})
					.finally(() => this.loading = false)
			} else {
				Axios.options(process.env.VUE_APP_API_ROUTE+route+"/", { headers: this.header })
					.then(response => {
						this.loading = true
						Object.keys(response.data.actions.POST).forEach(field => {
							if(!this.excludefield.includes(field) &&
								response.data.actions.POST[field]["type"] != "field") {
								this.fieldopt[masterindex][index].push({
									value: field,
									text: i18n.t(component+"."+field),
									fieldtype: response.data.actions.POST[field]["type"]
								})
							}
						})

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
			console.log(index)
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
		}
	}
}
</script>