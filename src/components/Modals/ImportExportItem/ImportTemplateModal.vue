<template>
	<div id="import-template-modal">
		<b-button 
			:title="$t('template.import_template')"
			variant="bg-light"
			class="form-control btn datatable-btn datatable-btn-maxsize"
			@click="importtemplate = !importtemplate"
		>
			<font-awesome-icon 
				:icon="['fas', 'download']"
			/>
		</b-button>

		<b-modal 
			id="import-template" 
			v-model="importtemplate"
			:title="$t('template.import_template')"
			hide-footer
			size="md"
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.import_template') }}
					<b-spinner 
						v-if="loadingimport"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="importwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="errored"
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
				@submit="onSubmit"
			>
				<Alert 
					v-if="errored"
					:message="errormsg" 
					variant="danger"
				/>
				<b-row>
					<b-col>
						<b-form-file
							:placeholder="$t('template.select_template_file')"
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
							{{ $t('generic.send') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'ImportTemplateModal',
	data() {
		return {
			errormsg: null,
			errored: false,
			loadingimport: false,
			importwithsuccess: false,
			importtemplate: false,
			file: null,
			jsonToSend: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		importwithsuccess: function() {
			setTimeout(() => {
				this.importtemplate = false
				this.importwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
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
				reader.onerror = (err) => this.errormsg = err
				reader.readAsText(this.file);
			}
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit() {
			this.loadingimport = true
			
			axios.post(this.$config.BACKEND_API_ROUTE+"templates/", this.jsonToSend, { headers: this.header })
				.then(() => {
					this.errormsg = null
					this.errored = false
					this.importwithsuccess = true
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
					this.importwithsuccess = false
				})
				.finally(() => this.loadingimport = false)
		}
	}
}
</script>