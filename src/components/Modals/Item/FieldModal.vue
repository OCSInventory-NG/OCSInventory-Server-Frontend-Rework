<template>
	<div id="field-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addfield')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="fieldmodal = !fieldmodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addfield') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('template.editfield')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="fieldmodal" 
			v-model="fieldmodal"
			:title="(!update) ? $t('template.addfield') : $t('template.editfield')"
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addfield') : $t('template.editfield') }}
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
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
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
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('template.retrieval_value')" 
							label-for="retrieval_value"
						>
							<b-form-input
								id="retrieval_value"
								v-model="row.retrieval_value"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row 
					v-if="routetypemut != 'snmp' && routetype != 'snmp'"
				>
					<b-col>
						<b-form-checkbox
							id="override_target"
							v-model="row.override_target"
							name="override_target"
							value="true"
							unchecked-value="false"
						>
							{{ $t('template.override_target') }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<div v-if="row.override_target == true || row.override_target == 'true'">
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.retrieval_method')" 
								label-for="retrieval_method"
							>
								<v-select
									id="retrieval_method"
									v-model="row.retrieval_method" 
									:options="methodoptions" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
								>
									<template #search="{attributes, events}">
										<input
											class="vs__search"
											:required="!row.retrieval_method"
											v-bind="attributes"
											v-on="events"
										>
									</template>
								</v-select>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.new_target')" 
								label-for="new_target"
							>
								<b-form-input
									id="new_target"
									v-model="row.new_target"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.retrieval_output')" 
								label-for="retrieval_output"
							>
								<v-select
									id="retrieval_output"
									v-model="row.retrieval_output" 
									:options="outputoptions" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
								>
									<template #search="{attributes, events}">
										<input
											class="vs__search"
											:required="!row.retrieval_output"
											v-bind="attributes"
											v-on="events"
										>
									</template>
								</v-select>
							</b-form-group>
						</b-col>
					</b-row>
					<div v-if="outputoptionoptions[row.retrieval_output]">
						<b-row>
							<b-col>
								<h4>{{ $t('template.retrieval_output_options') }}</h4>
							</b-col>
						</b-row>
						<div
							v-for="(value, key) in outputoptionoptions[row.retrieval_output]"
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
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
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
</template>

<script>
import axios from 'axios'

export default {
	name: "FieldModal",
	props: {
		routetype: { type: String, default: "assets" },
		section: { type: Number, default: null },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrieval_value: null,
				override_target: false,
				new_target: null,
				retrieval_method: null,
				retrieval_output: null,
				options: {},
				section: null
			},
			routetypemut: "assets",
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			fieldmodal: false,
			options: {},
			methodoptions: [
				{ value: 'FILE', text: this.$t('template.FILE') },
				{ value: 'BASH', text: this.$t('template.BASH') },
				{ value: 'PW', text: this.$t('template.PW') },
				{ value: 'CMD', text: this.$t('template.CMD') }
			],
			outputoptions: [
				{ value: 'PTXT', text: this.$t('template.PTXT') },
				{ value: 'JSON', text: this.$t('template.JSON') },
				{ value: 'REGX', text: this.$t('template.REGX') },
				{ value: 'GREP', text: this.$t('template.GREP') }
			],
			outputoptionoptions: {
				"JSON": [
					{ id: "submap", type: "text", default: null }
				]
			},
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			if (this.createwithsuccess) {
				setTimeout(() => {
					this.fieldmodal = false
					this.createwithsuccess = false
					this.row = {
						id: null,
						name: null,
						retrieval_value: null,
						override_target: false,
						new_target: null,
						retrieval_method: null,
						retrieval_output: null,
						options: {},
						section: this.section
					}
					this.$emit("reloadDatatable")
				}, 500)
			}
		}
	},
	created() {
		if(this.$route.path.includes("snmp")) {
			this.routetypemut = "snmp"
		}
	},
	mounted() {
		if(!this.update) {
			this.row.section = this.section
			this.loading = false
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.fieldmodal = true
			this.getField(id)
		},
		async getField(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"fields/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.options = this.row.options
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => {this.loading = false})
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if (!this.row.override_target || this.row.override_target === "false") {
				this.row.retrieval_method = null
				this.row.new_target = null
				this.row.retrieval_output = null
				this.row.options = {}
			}

			if(this.row.override_target == true && this.outputoptionoptions[this.row.retrieval_output] != undefined) {
				this.row.options = {}
				this.outputoptionoptions[this.row.retrieval_output].forEach(element => {
					this.row.options[element.id] = (this.options[element.id] != undefined) ? 
						this.options[element.id] : element.default
				})
			}
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"fields/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					})
					.finally(() => { this.loadingcreate = false })
			} else {
				axios.patch(this.$config.BACKEND_API_ROUTE+"fields/"+this.row.id+"/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => { this.loadingcreate = false })
			}			
		}
	}
}
</script>