<template>
	<div id="search">
		<b-form
			@submit="onSubmit"
		>
			<div
				v-for="(input, index) in datavalues"
				:key="`valueInput-${index}`"
				class="modal-allactions"
			>
				<b-row>
					<b-col>
						<b-form-group>
							<b-form-select
								:id="'route'+index"
								v-model="input.route" 
								:options="routeopt" 
								class="mb-3 form-select form-control"
								@input="getFields(input.route, index)"
							/>
						</b-form-group>
					</b-col>
					<b-col v-if="!loading">
						<b-form-group>
							<b-form-select
								:id="'field'+index"
								v-model="input.field" 
								:options="fieldopt[index]" 
								class="mb-3 form-select form-control"
							/>
						</b-form-group>
					</b-col>
					<b-col v-else>
						<b-form-group>
							<b-form-select
								:id="'field'+index"
								v-model="input.field"
								class="mb-3 form-select form-control"
							/>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group>
							<b-form-select
								:id="'operator'+index"
								v-model="input.operator" 
								:options="operatoropt" 
								class="mb-3 form-select form-control"
							/>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group>
							<b-form-input
								:id="'value'+index"
								v-model="input.value"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
					<b-col cols="1">
						<b-form-group>
							<b-button 
								v-b-modal="1"
								variant="primary"
								class="d-none d-sm-inline-block form-control"
								@click="addField(input, datavalues)"
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
								v-b-modal="1"
								variant="danger"
								class="d-none d-sm-inline-block form-control"
								@click="removeField(index, datavalues)"
							>
								<font-awesome-icon 
									:icon="['fas', 'trash-can']"
								/>
							</b-button>
						</b-form-group>
					</b-col>
				</b-row>
			</div>
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
			text: null,
			loading: true,
			datavalues: [
				{ route: "asset/bases", field: "", operator: "EQUAL", value: "" }
			],
			routeopt: [
				{ value: "asset/bases", text: i18n.t("title.assets") },
				{ value: "accountinfo/config", text: i18n.t("title.accountinfo") },
				{ value: "deployment/packages", text: i18n.t("title.deployment") },
			],
			fieldopt: [],
			operatoropt: [
				{ value: "EQUAL", text: i18n.t("search.equal") }
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		this.getFields("asset/bases", 0)
	},
	methods: {
		// Submit dynamic datas
		onSubmit(event) {
			event.preventDefault()
			this.$emit('reloadDatatable')
		},
		getFields(route, index) {
			Axios.options(process.env.VUE_APP_API_ROUTE+route+"/", { headers: this.header })
				.then(response => {
					this.loading = true

					var component = route.split("/")[0]
					this.fieldopt[index] = []

					if(component == "asset") {
						component = "inventory"
					}

					Object.keys(response.data.actions.POST).forEach(field => {
						this.fieldopt[index].push({
							value: field,
							text: i18n.t(component+"."+field)
						})
					})

					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		addField(value, fieldType) {
			fieldType.push({ route: "asset/bases", field: "", operator: "EQUAL", value: "" })
		},
		removeField(index, fieldType) {
			fieldType.splice(index, 1)
		},
	}
}
</script>