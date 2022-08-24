<template>
	<div id="EditSectionModal">
		<b-button 
			v-b-modal="'edit-section.'+idmodal"
			:title="$t('editsection')"
			variant="primary"
			class="add-button"
		>
			<b-icon 
				icon="pencil-square" 
				aria-hidden="true"
			/>
		</b-button>

		<b-modal 
			:id="'edit-section.'+idmodal"
			:title="$t('editsection')"
			hide-footer
			modal-class="custom-modal"
		>
			<b-form
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('name')" 
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
							:label="$t('retrival_method')" 
							label-for="retrival_method"
						>
							<b-form-select
								id="retrival_method"
								v-model="row.retrival_method" 
								:options="methodoptions" 
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('retrival_output')" 
							label-for="retrival_output"
						>
							<b-form-select
								id="retrival_output"
								v-model="row.retrival_output" 
								:options="outputoptions" 
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('target')" 
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
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ $t('save') }}
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
	name: 'EditSectionModal',
	props: {
		namesection: { type: String, default: null },
		retrivalmethod: { type: String, default: null },
		retrivaloutput: { type: String, default: null },
		target: { type: String, default: null },
		idmodal: { type: Number, required: true },
		template: { type: Number, required: true },
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_method: null,
				retrival_output: null,
				target: null,
				template: null
			},
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			methodoptions: [
				{ value: 'FILE', text: 'Read file' },
				{ value: 'BASH', text: 'Bash command' },
				{ value: 'PW', text: 'Powershell command' },
				{ value: 'CMD', text: 'Cmd command' }
			],
			outputoptions: [
				{ value: 'PTXT', text: 'Plain text' },
				{ value: 'JSON', text: 'JSON format' },
				{ value: 'TBLE', text: 'Table format' }
			]
		}
	},
	created() {
		this.row.name = this.namesection
		this.row.retrival_method = this.retrivalmethod
		this.row.retrival_output = this.retrivaloutput
		this.row.target = this.target
		this.row.id = this.idmodal
		this.row.template = this.template
	},
	methods: {
		// Submit edit section creation and call refresh edit template to reload
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			
			Axios.put(process.env.VUE_APP_API_ROUTE+"sections/"+this.row.id+"/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-section.'+this.row.id)
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-section.'+this.row.id)
				})
		},
	}
}
</script>
