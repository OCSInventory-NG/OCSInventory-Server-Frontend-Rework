<template>
	<div id="edit-field-modal">
		<button 
			v-b-modal="'edit-field.'+idmodal"
			:title="$t('template.editfield')"
			class="btn btn-ghost-dark"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="'edit-field.'+idmodal"
			:title="$t('template.editfield')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.editfield') }}
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
				<b-row>
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
								<b-form-select
									id="retrival_method"
									v-model="row.retrival_method" 
									:options="methodoptions" 
									class="mb-3 form-select"
								/>
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
								<b-form-select
									id="retrival_output"
									v-model="row.retrival_output" 
									:options="outputoptions" 
									class="mb-3 form-select"
								/>
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
										:value="true"
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
							{{ $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'

export default {
	name: 'EditFieldModal',
	props: {
		rowfielddata: { type: Object, default: null },
		idmodal: { type: Number, required: true },
		section: { type: Number, required: true },
	},
	data() {
		return {
			row: null,
			options: {},
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
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
	created() {
		this.row = this.rowfielddata
		this.options = this.row.options
	},
	methods: {
		// Submit edit section creation and call refresh edit template to reload
		onSubmit(event) {
			event.preventDefault()

			if(this.row.override_target == true && this.outputoptionoptions[this.row.retrival_output] != undefined) {
				this.row.options = {}
				this.outputoptionoptions[this.row.retrival_output].forEach(element => {
					this.row.options[element.id] = (this.options[element.id] != undefined) ? 
						this.options[element.id] : element.default
				})
			}
			
			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"fields/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-field.'+this.row.id)
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-field.'+this.row.id)
				})
		},
	}
}
</script>
