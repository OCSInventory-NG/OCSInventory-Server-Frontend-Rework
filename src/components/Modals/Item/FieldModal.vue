<template>
	<div id="field-modal">
		<b-button
			v-if="!update"
			:title="$t('template.addfield')"
			variant="success"
			class="add-button"
			@click="fieldmodal = !fieldmodal"
		>
			<font-awesome-icon 
				:icon="['fas', 'plus']"
			/>
		</b-button>
		<div v-else>
			<button 
				:title="$t('template.editfield')"
				class="btn btn-ghost-dark"
				@click="loadData()"
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
							:label="$t('template.retrival_value')" 
							label-for="retrival_value"
						>
							<b-form-input
								id="retrival_value"
								v-model="row.retrival_value"
								required
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
				<div v-if="row.override_target == 'true'">
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.retrival_method')" 
								label-for="retrival_method"
							>
								<v-select
									id="retrival_method"
									v-model="row.retrival_method" 
									:options="methodoptions" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
								>
									<template #search="{attributes, events}">
										<input
											class="vs__search"
											:required="!row.retrival_method"
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
								:label="$t('template.retrival_output')" 
								label-for="retrival_output"
							>
								<v-select
									id="retrival_output"
									v-model="row.retrival_output" 
									:options="outputoptions" 
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
								>
									<template #search="{attributes, events}">
										<input
											class="vs__search"
											:required="!row.retrival_output"
											v-bind="attributes"
											v-on="events"
										>
									</template>
								</v-select>
							</b-form-group>
						</b-col>
					</b-row>
					<div v-if="outputoptionoptions[row.retrival_output]">
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
		rowfielddata: { type: Object, default: null },
		section: { type: Number, required: true },
		update: { type: Boolean, default: false }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_value: null,
				override_target: false,
				new_target: null,
				retrival_method: null,
				retrival_output: null,
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
			},
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.fieldmodal = false
				this.createwithsuccess = false
				this.$emit("reloadTemplate")
			}, 500)
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
		loadData() {
			this.loading = true
			this.fieldmodal = true
			this.row = this.rowfielddata
			this.options = this.row.options
			this.loading = false
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.row.override_target == true && this.outputoptionoptions[this.row.retrival_output] != undefined) {
				this.row.options = {}
				this.outputoptionoptions[this.row.retrival_output].forEach(element => {
					this.row.options[element.id] = (this.options[element.id] != undefined) ? 
						this.options[element.id] : element.default
				})
			}
			
			if(!this.update) {
				axios.post(import.meta.env.VITE_APP_API_ROUTE+"fields/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				axios.patch(import.meta.env.VITE_APP_API_ROUTE+"fields/"+this.row.id+"/", this.row, { headers: this.header })
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
}
</script>