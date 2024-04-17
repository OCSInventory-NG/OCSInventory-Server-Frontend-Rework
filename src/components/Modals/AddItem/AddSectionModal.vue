<template>
	<div 
		id="add-section-modal"
		class="container-xl"
	>
		<div class="page-header d-print-none text-white">
			<div class="row align-items-center">
				<div class="col">
					<div class="page-pretitle">
						<Breadcrumb />
					</div>
					<h2 class="page-title">
						{{ $t('template.edittemplate') }}
					</h2>
				</div>
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addsection')"
						variant="primary"
						class="d-none d-sm-inline-block"
						@click="addsection = !addsection"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addsection') }}
					</b-button>

					<b-modal 
						id="add-section" 
						v-model="addsection"
						:title="$t('template.addsection')"
						hide-footer
						modal-class="custom-modal modal-blur"
					>
						<template #header="{ close }">
							<h5 class="modal-title">
								{{ $t('template.addsection') }}
								<b-spinner 
									v-if="loadingcreate"
									variant="success"
								/>
								<font-awesome-icon 
									v-if="createwithsuccess"
									:icon="['fas', 'check']"
									color="green"
								/>
								<font-awesome-icon 
									v-if="createerror"
									:icon="['fas', 'xmark']"
									color="red"
								/>
							</h5>
							<b-button 
								size="sm" 
								variant="outline-danger" 
								@click="close()"
							>
								<font-awesome-icon 
									:icon="['fas', 'xmark']"
									size="1x"
								/>
							</b-button>
						</template>
						<b-form
							v-if="!loading"
							@submit="onSubmit"
						>
							<Alert 
								v-if="createerror"
								:message="createerrormsg" 
								variant="danger"
							/>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('user.name')" 
										label-for="name"
									>
										<b-form-input
											id="name"
											v-model="row.name"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="routetype != 'snmp'">
								<b-col>
									<b-form-group
										:label="$t('template.retrival_method')" 
										label-for="retrival_method"
									>
										<b-form-select
											id="retrival_method"
											v-model="row.retrival_method" 
											:options="methodoptions" 
											class="mb-3 form-select"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="routetype != 'snmp'">
								<b-col>
									<b-form-group
										:label="$t('template.target')" 
										label-for="target"
									>
										<b-form-input
											id="target"
											v-model="row.target"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="routetype != 'snmp'">
								<b-col>
									<b-form-group
										:label="$t('template.retrival_output')" 
										label-for="retrival_output"
									>
										<b-form-select
											id="retrival_output"
											v-model="row.retrival_output" 
											:options="outputoptions" 
											class="mb-3 form-select"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<div 
								v-if="outputoptionoptions[row.retrival_output]
									&& routetype != 'snmp'"
							>
								<b-row>
									<b-col>
										<h4>{{ $t('template.retrieval_output_options') }}</h4>
									</b-col>
								</b-row>
								<div
									v-for="(value, key) in outputoptionoptions[row.retrival_output]"
									:key="key"
								>
									<b-row v-if="value.type == 'text'">
										<b-col>
											<b-form-group
												:label="$t('template.'+value.id)" 
												:label-for="value.id"
											>
												<b-form-input
													:id="value.id"
													v-model="options[value.id]"
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row v-if="value.type == 'number'">
										<b-col>
											<b-form-group
												:label="$t('template.'+value.id)" 
												:label-for="value.id"
											>
												<b-form-input
													:id="value.id"
													v-model="options[value.id]"
													type="number"
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row v-if="value.type == 'checkbox'">
										<b-col>
											<b-form-checkbox
												:id="value.id"
												v-model="options[value.id]"
												:name="value.id"
												value="true"
												:unchecked-value="value.default"
											>
												{{ $t('template.'+value.id) }}
											</b-form-checkbox>
										</b-col>
									</b-row>
								</div>
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
										{{ $t('generic.add') }}
									</b-button>
								</b-col>
								<b-col align-self="end" />
							</b-row>
						</b-form>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
					</b-modal>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'

export default {
	name: 'AddSectionModal',
	components: { Breadcrumb },
	props: {
		template: { type: String, required: true },
		routetype: { type: String, default: "assets" }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_method: 'FILE',
				retrival_output: null,
				target: null,
				fields: [],
				template: null,
				options: {}
			},
			snmprow: {
				id: null,
				name: null,
				retrival_method: "OID",
				retrival_output: "JSON",
				target: "SNMP",
				fields: [],
				template: null,
				options: {}
			},
			options : {},
			rowdata: [],
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			addsection: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			methodoptions: [
				{ value: 'FILE', text: this.$t('template.FILE') },
				{ value: 'BASH', text: this.$t('template.BASH') },
				{ value: 'PW', text: this.$t('template.PW') },
				{ value: 'CMD', text: this.$t('template.CMD') }
			],
			outputoptions: [
				{ value: 'PTXT', text: this.$t('template.PTXT') },
				{ value: 'JSON', text: this.$t('template.JSON') },
				{ value: 'TBLE', text: this.$t('template.TBLE') },
				{ value: 'REGX', text: this.$t('template.REGX') },
				{ value: 'GREP', text: this.$t('template.GREP') }
			],
			outputoptionoptions: {
				"TBLE": [
					{ id: "use_index", type: "checkbox", default: false },
					{ id: "remove_line", type: "text", default: null },
					{ id: "override_line_used", type: "number", default: null }
				],
				"JSON": [
					{ id: "need_format", type: "checkbox", default: false },
					{ id: "submap", type: "text", default: null },
					{ id: "is_list", type: "checkbox", default: false }
				],
				"REGX": [
					{ id: "multiple", type: "checkbox", default: false },
					{ id: "separator", type: "text", default: null },
				]
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.addsection = false
				this.createwithsuccess = false
				this.$emit('reloadTemplate')
			}, 500)
		}
	},
	mounted() {
		if(this.routetype == "snmp") {
			this.row = this.snmprow
		}
		this.row.template = this.template
		this.loading = false
	},
	methods: {
		// Submit template creation and call getTemplates to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.outputoptionoptions[this.row.retrival_output] != undefined) {
				this.outputoptionoptions[this.row.retrival_output].forEach(element => {
					this.row.options[element.id] = (this.options[element.id] != undefined) ? 
						this.options[element.id] : element.default
				})
			}

			Axios.post(import.meta.env.VITE_APP_API_ROUTE+"sections/", this.row, { headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				})
				.catch(e => {
					this.createerrormsg = e.message
					this.createerror = true
					this.createwithsuccess = false
				})
				.finally(() => this.loadingcreate = false)
		}
	}
}
</script>
