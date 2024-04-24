<template lang="">
	<div id="rule-criteria">
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
									<b-form-select
										id="field"
										v-model="input.field"
										:options="fields" 
										class="mb-3 form-select form-control"
										:disabled="(loadingfield) ? true : false"
									/>
								</b-form-group>
							</b-col>
							<b-col cols="3">
								<b-form-group>
									<b-form-select
										id="operator"
										v-model="input.operator"
										:options="operators"
										class="mb-3 form-select form-control"
										:required="true"
									/>
								</b-form-group>
							</b-col>
							<b-col cols="3">
								<b-form-group>
									<b-form-input
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
								v-show="datavalues[masterindex].length > 1"
								cols="1"
							>
								<b-form-group>
									<b-button 
										:id="'removefield'+masterindex+index"
										v-b-modal="1"
										variant="danger"
										class="d-none d-sm-inline-block form-control"
										:title="$t('rule.removeandcondition')"
										@click="removeAndCondition(masterindex, index, datavalues)"
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
import axios from 'axios'

export default {
	name: "RuleCriteria",
	props: {
		id: { type: String, required: true },
		trigger: { type: String, default: "inventory_received" },
		logic: { type: Object, default: null }
	},
	data() {
		return {
			loading: true,
			errormsg: null,
			errorCode: null,
			errored: false,
			successed: false,
			succesMsg: null,
			logicupdate: {
				logic: {}
			},
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			loadingfield: true,
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
					}
				]
			],
			links: [ "and", "or" ],
			disabledvalue: ["!!", "!"]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	mounted() {
		this.getLogicRow()
	},
	methods: {
		getModelField() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+this.triggermodel[this.trigger].route, { headers: this.header })
				.then(response => {
					this.loadingfield = true

					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "inventory_sections") {
							this.fields.push({
								value: field,
								text: this.$t(this.triggermodel[this.trigger].key + field)
							})
						}
					})

					this.loadingfield = false
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
				})
				.finally(() => { this.loading = false })
		},
		getLogicRow() {
			if(this.logic.lenth > 0) {
				this.datavalues = []
			}

			var masterindex = 0

			Object.keys(this.logic).forEach(key => {
				if(!this.links.includes(key)) {
					this.datavalues = [
						[
							{
								field: this.logic[key][0].var 
									?? this.logic[key][1].var,
								operator: key,
								value: (this.logic[key][1] && this.logic[key][1].var) ? 
									this.logic[key][0] : ((this.logic[key][1]) ?
										this.logic[key][1] : null)
							}
						]
					]
				} else if(key == "and") {
					this.datavalues[masterindex] = []
					Object.keys(this.logic[key]).forEach(and => {
						Object.keys(this.logic[key][and]).forEach(operator => {
							this.datavalues[masterindex].push({
								field: this.logic[key][and][operator][0].var
									?? this.logic[key][and][operator][1].var,
								operator: operator,
								value: (this.logic[key][and][operator][1] && this.logic[key][and][operator][1].var) ? 
									this.logic[key][and][operator][0]  : ((this.logic[key][and][operator][1]) ?
										this.logic[key][and][operator][1] : null)
							})
						})
					})
				} else if(key == "or") {
					Object.keys(this.logic[key]).forEach(or => {
						this.datavalues[masterindex] = []

						Object.keys(this.logic[key][or]).forEach(key2 => {
							if(key2 == "and") {
								Object.keys(this.logic[key][or][key2]).forEach(and => {
									Object.keys(this.logic[key][or][key2][and]).forEach(operator => {
										this.datavalues[masterindex].push({
											field: this.logic[key][or][key2][and][operator][0].var
												?? this.logic[key][or][key2][and][operator][1].var,
											operator: operator,
											value: (this.logic[key][or][key2][and][operator][1] 
											&& this.logic[key][or][key2][and][operator][1].var) ? 
												this.logic[key][or][key2][and][operator][0]  : 
												((this.logic[key][or][key2][and][operator][1]) ?
													this.logic[key][or][key2][and][operator][1] : null)
										})
									})
								})
							} else {
								this.datavalues[masterindex].push({
									field: this.logic[key][or][key2][0].var
										?? this.logic[key][or][key2][1].var,
									operator: key2,
									value: (this.logic[key][or][key2][1] && this.logic[key][or][key2][1].var) ? 
										this.logic[key][or][key2][0] : ((this.logic[key][or][key2][1]) ?
											this.logic[key][or][key2][1] : null)
								})
							}

							masterindex++
						})
					})
				}
			})

			this.datavalues = JSON.parse(JSON.stringify(this.datavalues))

			this.getModelField()
		},
		addAndCondition(masterindex, index, fieldType) {
			fieldType[masterindex].push(
				{
					field: "id",
					operator: "==",
					value: null
				}
			)
		},
		removeAndCondition(masterindex, index, fieldType) {
			fieldType[masterindex].splice(index, 1)
		},
		addOrCondition(fieldType) {
			var masterindex = fieldType.length
			fieldType[masterindex] = []

			fieldType[masterindex].push(
				{
					field: "id",
					operator: "==",
					value: null
				}
			)

			this.datavalues = JSON.parse(JSON.stringify(fieldType))
		},
		removeOrCondition(masterindex, fieldType) {
			fieldType.splice(masterindex, 1)
		},
		pushInLogicComplexe(object, key, logics) {
			if(this.disabledvalue.includes(logics[key].operator)) {
				object.push({
					[logics[key].operator]: [
						{ var: logics[key].field }
					]
				})
			} else if(logics[key].operator == "in") {
				object.push({
					[logics[key].operator]: [
						logics[key].value,
						{ var: logics[key].field }
					]
				})
			} else {
				object.push({
					[logics[key].operator]: [
						{ var: logics[key].field },
						logics[key].value
					]
				})
			}

			return object
		},
		pushInLogicSimple(object, key, logics) {
			if(this.disabledvalue.includes(logics[key].operator)) {
				object[logics[key].operator] = [
					{ var: logics[key].field }
				]
			} else if(logics[key].operator == "in") {
				object[logics[key].operator] = [
					logics[key].value,
					{ var: logics[key].field }
				]
			} else {
				object[logics[key].operator] = [
					{ var: logics[key].field },
					logics[key].value
				]
			}

			return object
		},
		onSubmit(event) {
			event.preventDefault()
			var logicTmp = {}
			var firstKey = null

			if(this.datavalues.length > 1) {
				logicTmp.or = []
				firstKey = "or"
			}

			this.datavalues.forEach(logics => {
				if(logics.length > 1) {
					if(firstKey == null) {
						logicTmp.and = []
						firstKey = "and"
					}

					var tmpAnd = {}
					tmpAnd.and = []

					Object.keys(logics).forEach(key => {
						if(firstKey == "and") {
							logicTmp.and = this.pushInLogicComplexe(logicTmp.and, key, logics)
						} else {
							tmpAnd.and = this.pushInLogicComplexe(tmpAnd.and, key, logics)
						}
					})
					
					if(tmpAnd.and.length > 0) {
						logicTmp.or.push(tmpAnd)
					}
				} else if(firstKey == null) {
					logicTmp = this.pushInLogicSimple(logicTmp, 0, logics)
				} else {
					Object.keys(logics).forEach(key => {
						logicTmp.or = this.pushInLogicComplexe(logicTmp.or, key, logics)
					})
				}
			})

			this.logicupdate.logic = logicTmp

			axios.patch(import.meta.env.VITE_APP_API_ROUTE+"automation/rule/"+this.id+"/", this.logicupdate, 
				{ headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errormsg = null
					this.errored = false
					this.$emit('reloadRule')
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
		}
	}
}
</script>