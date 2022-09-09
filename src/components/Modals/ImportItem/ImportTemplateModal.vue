<template>
	<div id="import-template-modal">
		<b-button 
			v-b-modal.import-template
			:title="$t('import_template')"
			class="form-control btn"
		>
			<font-awesome-icon 
				:icon="['fas', 'upload']"
			/>
		</b-button>

		<b-modal 
			id="import-template" 
			:title="$t('import_template')"
			hide-footer
			size="md"
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('import_template') }}
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
						<b-form-file
							:placeholder="$t('select_template_file')"
							accept=".json"
							@change="processFile($event)"
						/>
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
							{{ $t('send') }}
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
	name: 'ImportTemplateModal',
	data() {
		return {
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			file: null,
			jsonToSend: null,
		}
	},
	methods: {
		processFile(event) {
			this.file = event.target.files[0]
			const reader = new FileReader();
			if (this.file.name.includes(".json")) {
				reader.onload = (res) => {
					this.jsonToSend = res.target.result
				};
				reader.onerror = (err) => this.errorMsg = err
				reader.readAsText(this.file);
			}
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			Axios.post(process.env.VUE_APP_API_ROUTE+"templates/", this.jsonToSend, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('import-template')
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('import-template')
				})
		}
	}
}
</script>