<template lang="">
	<div id="rule-criteria">
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
							<b-col cols="2">
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
import Axios from 'axios'
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'

export default {
	name: "RuleCriteria",
	components: { Loader },
	props: {
		trigger: { type: String, default: "inventory_received" },
		logic: { type: Object, default: null }
	},
	data() {
		return {
			loading: true,
			errorMsg: null,
			errorCode: null,
			errored: false,
			successed: false,
			succesMsg: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			loadingfield: true,
			fields: [],
			operators: [
				{ value: "==", text: i18n.t("rule.equal") },
				{ value: "!=", text: i18n.t("rule.notequal") },
				{ value: ">", text: i18n.t("rule.morethan") },
				{ value: ">=", text: i18n.t("rule.morethanorequal") },
				{ value: "<", text: i18n.t("rule.lessthan") },
				{ value: "<=", text: i18n.t("rule.lessthanorequal") },
				{ value: "!!", text: i18n.t("rule.boolean") },
				{ value: "!", text: i18n.t("rule.not") },
				{ value: "in", text: i18n.t("rule.contains") },
				{ value: "regex", text: i18n.t("rule.regex") }
			],
			triggermodel: {
				"inventory_received": {
					route: "asset/bases/",
					key: "inventory."
				},
				"user_login": {
					route: "users/",
					key: "user"
				},
				"netdevice_received": {
					route: "netdevices/",
					key: "network"
				}
			},
			operatortargets: {
				"==": i18n.t("rule.equal"),
				"!=": i18n.t("rule.notequal"),
				">": i18n.t("rule.morethan"),
				">=": i18n.t("rule.morethanorequal"),
				"<": i18n.t("rule.lessthan"),
				"<=": i18n.t("rule.lessthanorequal"),
				"!!": i18n.t("rule.boolean"),
				"!": i18n.t("rule.not"),
				"in": i18n.t("rule.contains"),
				"regex": i18n.t("rule.regex")
			},
			datavalues: [
				[
					{
						field: "id",
						operator: "==",
						value: null,
					}
				]
			]
		}
	},
	mounted() {
		this.getLogicRow()
	},
	methods: {
		getModelField() {
			Axios.options(process.env.VUE_APP_API_ROUTE+this.triggermodel[this.trigger].route, { headers: this.header })
				.then(response => {
					this.loadingfield = true

					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "inventory_sections") {
							this.fields.push({
								value: field,
								text: i18n.t(this.triggermodel[this.trigger].key + field)
							})
						}
					})

					this.loadingfield = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => { this.loading = false })
		},
		getLogicRow() {
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
		onSubmit() {

		}
	}
}
</script>