<template>
	<div id="AddSectionModal">
		<b-button 
			v-b-modal.add-section
			:title="$t('addsection')"
			variant="success"
			class="add-button"
		>
			<font-awesome-icon 
				:icon="['fas', 'plus']"/>
		</b-button>

		<b-modal 
			id="add-section" 
			:title="$t('addsection')"
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
					<b-col align-self="start"/>
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ $t('add') }}
						</b-button>
					</b-col>
					<b-col align-self="end"/>
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'

const header = {
	"Content-Type": "application/json;charset=utf-8",
	"Authorization": 'Token ' + localStorage.getItem('token_authentication')
}

export default {
	name: 'AddSectionModal',
	props: {
		template: { type: Number, required: true },
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_method: 'FILE',
				retrival_output: 'PTXT',
				target: null,
				template: null
			},
			rowdata: [],
			loading: true,
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
		this.row.template = this.template
	},
	methods: {
		// Submit template creation and call getTemplates to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"sections/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-section')
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-section')
				})
		}
	}
}
</script>
