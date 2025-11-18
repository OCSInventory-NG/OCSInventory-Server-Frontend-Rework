<template lang="">
	<div id="rule-action">
		<!-- Display success box message -->
		<section v-if="successed">
			<Alert 
				:message="$t('message.success_saved')" 
				variant="success"
			/>
		</section>

		<!-- Display error box message -->
		<section v-if="errored && errorCode == null">
			<Alert 
				:message="errormsg.message" 
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
				class="modal-allactions multisearch-card"
			>
				<div
					v-for="(input, index) in datavalues"
					:key="`valueInput-${index}`"
					class="modal-allactions"
				>
					<b-row>
						<b-col>
							<b-form-group>
								<v-select
									:id="'route'+index"
									v-model="input.model" 
									:options="routeopt[trigger]" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									@option:selected="getFields(index, input.model, true)"
								/>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group>
								<v-select
									:id="'field'+index"
									v-model="input.field" 
									:options="fieldopt[index]" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3 ocs-select"
									:loading="(loadingfield) ? true : false"
									@option:selected="setFieldType(input, index)"
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
						<b-col cols="1">
							<b-form-group>
								<span 
									class="badge bg-blue form-control ocs-span"
								>
									{{ $t("rule.set") }}
								</span>
							</b-form-group>
						</b-col>
						<b-col cols="3">
							<b-form-group>
								<b-form-input
									v-if="!selectfield.includes(input.fieldtype)"
									:id="'value'+index"
									v-model="input.value"
									:type="inputype[input.fieldtype]"
									class="mb-3"
								/>
								<div v-else>
									<v-select
										:id="'value'+index"
										v-model="input.value" 
										:options="selectfieldopt[index]" 
										:reduce="text => text.value"
										:clearable="false"
										label="text"
										class="mb-3 ocs-select"
										:loading="(loadingselect) ? true : false"
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
						<b-col cols="1">
							<b-form-group>
								<b-button 
									:id="'addfield'+index"
									v-b-modal="1"
									variant="primary"
									class="d-none d-sm-inline-block form-control"
									:title="$t('rule.addaction')"
									@click="addAction(index, datavalues)"
								>
									<font-awesome-icon 
										:icon="['fas', 'plus']"
									/>
								</b-button>
							</b-form-group>
						</b-col>
						<b-col 
							v-show="datavalues.length > 1"
							cols="1"
						>
							<b-form-group>
								<b-button 
									:id="'removefield'+index"
									v-b-modal="1"
									variant="danger"
									class="d-none d-sm-inline-block form-control"
									:title="$t('rule.removeaction')"
									@click="removeAction(index, datavalues)"
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
import axios from 'axios'

export default {
	name: "RuleAction",
	props: {
		id: { type: String, required: true },
		trigger: { type: String, default: "inventory_received" },
		triggers: { type: Array, default: null },
		actions: { type: Array, default: null }
	},
	data() {
		return {
			loading: false,
			errormsg: null,
			errorCode: null,
			errored: false,
			successed: false,
			successmsg: null,
			actionupdate: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			loadingfield: true,
			fields: [],
			fieldopt: [],
			actionstrigger: {},
			routeopt: {
				"inventory_received": [
					{ value: "accountinfo.accountinfoconfig", text: this.$t("title.accountinfo") },
					{ value: "inventory_base.inventorybase", text: this.$t("title.assets") }
				],
				"user_login": [
					{ value: "auth.user", text: this.$t("title.users") }
				],
				"netdevice_received": [
					{ value: "accountinfo.accountinfoconfig", text: this.$t("title.accountinfo") },
				]
			},
			routetargets: {
				"inventory_received": {
					"accountinfo.accountinfoconfig": {
						route: "accountinfo/config?datatarget=ASSET",
						key: "accountinfo"
					},
					"inventory_base.inventorybase": {
						route: "asset/bases/",
						key: "inventory"
					}
				},
				"user_login": {
					"auth.user": {
						route: "users/",
						key: "user"
					},
				},
				"netdevice_received": {
					"accountinfo.accountinfoconfig": {
						route: "accountinfo/config?datatarget=IPDISCOVER",
						key: "accountinfo"
					}
				}
			},
			selectfield: ["select", "checkbox", "field"],
			selectfieldopt: [],
			loadingselect: true,
			inputype: {
				"string": "text",
				"integer": "number",
				"datetime": "datetime-local"
			},
			defaultrouteopt: {
				"inventory_received": "inventory_base.inventorybase",
				"user_login": "auth.user",
				"netdevice_received": "accountinfo.accountinfoconfig",
			},
			linktype: {
				"TEXT": "string",
				"TEXTAREA": "string",
				"SELECT": "select",
				"CHECKBOX": "checkbox"
			},
			datavalues: []
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		for (const trigger of this.triggers) {
			if(trigger.trigger == this.trigger) {
				this.actionstrigger = trigger.action_targets
			}
		}

		if(this.actions.length == 0) {
			this.datavalues = [
				{
					id: null,
					object_slug: null,
					model: this.defaultrouteopt[this.trigger],
					field: null,
					fieldtype: "string",
					action: "set",
					value: null,
				}
			]
		} else {
			for (const action of this.actions) {
				var model = (action.object_slug == null) ? this.defaultrouteopt[this.trigger] : action.object_slug
				var field = action.field.split(":")
				var regex = /\[|\]/g

				this.datavalues.push({
					id: action.id,
					object_slug: action.object_slug,
					model: model,
					field: (field.length > 1) ? field[1] : field[0],
					fieldtype: (field == "template") ? "field" : action.description,
					action: "set",
					value: (field.length == 2) ? action.value.replace(regex, "") : action.value,
				})
			}
		}

		for (let key in this.datavalues) {
			await this.getFields(key, this.datavalues[key].model)
			await this.setFieldType(this.datavalues[key], key)
		}
	},
	methods: {
		async getFields(index, model, reload = false) {
			var route = this.routetargets[this.trigger][model].route
			var component = this.routetargets[this.trigger][model].key

			if(!Array.isArray(this.fieldopt[index])) {
				this.fieldopt[index] = []
			}

			if (reload) {
				this.datavalues[index]["field"] = null
				this.datavalues[index]["fieldtype"] = null
				this.datavalues[index]["value"] = null
			}

			this.loadingfield = true

			if(model == "accountinfo.accountinfoconfig") {
				await axios.get(this.$config.BACKEND_API_ROUTE+route, { headers: this.header })
					.then(response => {
						this.fieldopt[index] = []

						for (const field of response.data) {
							this.fieldopt[index].push({
								value: field.id.toString(),
								text: field.name,
								fieldtype: this.linktype[field.datatype]
							})
						}

						this.fieldopt[index].sort((a,b) => (a.text > b.text) ?
							1 : ((b.text > a.text) ? -1 : 0))
					})
					.catch(e => {
						this.errormsg = e
						this.errored = true
					})
			} else {
				await axios.options(this.$config.BACKEND_API_ROUTE+route, { headers: this.header })
					.then(response => {
						this.loadingfield = true

						this.fieldopt[index] = []

						for (const field in response.data.actions.POST) {
							if( this.actionstrigger[model].includes(field)) {
								this.fieldopt[index].push({
									value: field.toString(),
									text: this.$t(component+"."+field),
									fieldtype: response.data.actions.POST[field]["type"]
								})
							}
						}

						this.fieldopt[index].sort((a,b) => (a.text > b.text) ?
							1 : ((b.text > a.text) ? -1 : 0))

						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = e
						this.errored = true
					})
			}

			this.loadingfield = false
		},
		async setFieldType(input, index) {
			for (const element of this.fieldopt[index]) {
				if(element.value == input.field) {
					input.fieldtype = element.fieldtype
				}
			}

			if(input.fieldtype == "field") {
				var route = input.field

				if(route == "template") {
					route = "templates"
				}

				await axios.get(this.$config.BACKEND_API_ROUTE+route, { headers: this.header })
					.then(response => {
						this.loadingselect = true
						this.selectfieldopt[index] = []

						for (const element of response.data) {
							this.selectfieldopt[index].push({
								value: element.id.toString(),
								text: element.name
							})
						}

						this.loadingselect = false
					})
					.catch(e => {
						this.errormsg = e
						this.errored = true
					})
			} else if(input.fieldtype == "select" || input.fieldtype == "checkbox") {
				await axios.get(this.$config.BACKEND_API_ROUTE+"accountinfo/value?accountinfo_config="+input.field, 
					{ headers: this.header })
					.then(response => {
						this.loadingselect = true

						this.selectfieldopt[index] = []

						for (const element of response.data) {
							this.selectfieldopt[index].push({
								value: element.id.toString(),
								text: element.value
							})
						}

						this.loadingselect = false
					})
					.catch(e => {
						this.errormsg = e
						this.errored = true
					})
			}
		},
		addAction(index, fieldType) {
			fieldType.push(
				{
					id: null,
					object_slug: null,
					model: this.defaultrouteopt[this.trigger],
					field: null,
					fieldtype: "string",
					action: "set",
					value: null,
				}
			)
			this.getFields(index+1, this.defaultrouteopt[this.trigger])
		},
		removeAction(index, fieldType) {
			fieldType.splice(index, 1)
			this.fieldopt.splice(index, 1)
		},
		async onSubmit(event) {
			event.preventDefault();

			this.actionupdate = []
			var actionremove = []
			var actionupdateids = []
			
			for (const action of this.datavalues) {
				if(action.id != null) {
					actionupdateids.push(action.id)
				}
				
				if(action.model == "accountinfo.accountinfoconfig") {
					if(action.fieldtype == "checkbox") {
						this.actionupdate.push({
							id: action.id,
							description: action.fieldtype,
							action: "set",
							field: "accountdata:"+action.field,
							value: "["+action.value+"]",
							object_id: action.field,
							object_slug: action.model.toLowerCase(),
							rule: parseInt(this.id)
						})
					} else if(action.fieldtype == "select") {
						this.actionupdate.push({
							id: action.id,
							description: action.fieldtype,
							action: "set",
							field: "accountdata:"+action.field+":value",
							value: action.value,
							object_id: action.field,
							object_slug: action.model.toLowerCase(),
							rule: parseInt(this.id)
						})
					} else {
						this.actionupdate.push({
							id: action.id,
							description: action.fieldtype,
							action: "set",
							field: "accountdata:"+action.field,
							value: action.value,
							object_id: action.field,
							object_slug: action.model.toLowerCase(),
							rule: parseInt(this.id)
						})
					}
				} else {
					this.actionupdate.push({
						id: action.id,
						description: action.fieldtype,
						action: "set",
						field: action.field,
						value: action.value,
						rule: parseInt(this.id),
						object_id: null,
						object_slug: null
					})
				}
			}

			for (const action of this.actions) {
				if(!actionupdateids.includes(action.id)) {
					actionremove.push(action.id)
				}
			}

			for (const action of this.actionupdate) {
				if(action.id != null) {
					await axios.patch(this.$config.BACKEND_API_ROUTE+"automation/action/"+action.id+"/", action, 
						{ headers: this.header })
						.then(() => {
							this.successmsg = "success"
							this.successed = true
							this.errormsg = null
							this.errored = false
						})
						.catch(e => {
							this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
							this.errored = true
							this.successmsg = null
							this.successed = false
						})
				} else {
					delete action.id

					await axios.post(this.$config.BACKEND_API_ROUTE+"automation/action/", action, 
						{ headers: this.header })
						.then(() => {
							this.successmsg = "success"
							this.successed = true
							this.errormsg = null
							this.errored = false
						})
						.catch(e => {
							this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
							this.errored = true
							this.successmsg = null
							this.successed = false
						})
				}
			}

			for (const id of actionremove) {
				await axios.delete(this.$config.BACKEND_API_ROUTE+"automation/action/"+id, { headers: this.header })
					.then(() => {
						this.successmsg = "success"
						this.successed = true
						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
						this.successmsg = null
						this.successed = false
					})
			}


			this.$emit('reloadRule')
		}
	}
}
</script>