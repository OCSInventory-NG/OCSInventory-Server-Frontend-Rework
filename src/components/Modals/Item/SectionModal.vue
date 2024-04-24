<template>
	<div id="section-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addsection')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="sectionmodal = !sectionmodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addsection') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('template.editsection')"
				class="btn btn-ghost-dark"
				@click="loadData()"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="sectionmodal" 
			v-model="sectionmodal"
			:title="(!update) ? $t('template.addsection') : $t('template.editsection')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addsection') : $t('template.editsection') }}
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
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
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
									/>
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
	name: "SectionModal",
	props: {
		rowsectiondata: { type: Object, default: null },
		template: { type: Number, required: true },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
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
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			sectionmodal: false,
			options : {},
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
				this.sectionmodal = false
				this.createwithsuccess = false
				this.$emit("reloadTemplate")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.row.template = this.template
			this.loading = false
		} else {
			this.row = this.rowsectiondata
			this.options = this.row.options
			this.row.id = this.id
			this.row.template = this.template

			if(this.options == null && this.outputoptionoptions[this.row.retrival_output] != undefined) {
				this.options = {}
				this.outputoptionoptions[this.row.retrival_output].forEach(element => {
					this.options[element.id] = element.default
				})
			}
		}
	},
	methods: {
		loadData() {
			this.loading = true
			this.sectionmodal = true
			this.loading = false
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.outputoptionoptions[this.row.retrival_output] != undefined) {
				this.row.options = {}
				this.outputoptionoptions[this.row.retrival_output].forEach(element => {
					this.row.options[element.id] = (this.options[element.id] != undefined) ? 
						this.options[element.id] : element.default
				})
			}
			
			if(!this.update) {
				axios.post(import.meta.env.VITE_APP_API_ROUTE+"sections/", this.row, { headers: this.header })
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
			} else {
				delete this.row.fields

				axios.patch(import.meta.env.VITE_APP_API_ROUTE+"sections/"+this.row.id+"/", this.row, { headers: this.header })
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