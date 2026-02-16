<template>
	<div id="import-template-modal">
		<b-button 
			:title="$t('template.import_template')"
			variant="bg-light"
			class="form-control btn datatable-btn datatable-btn-maxsize"
			@click="loadData()"
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
			scrollable
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
							ref="fileInput"
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
export default {
	name: 'ImportTemplateModal',
	data() {
		return {
			errormsg: null,
			errored: false,

			importwithsuccess: false,
			
			importtemplate: false,
			file: null,
			jsonToSend: null,
			
			loadingimport: false,
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
		loadData() {
			this.importtemplate = true
			this.file = null
			this.jsonToSend = null
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false

			this.$refs?.fileInput?.reset?.()
		},

		processFile(event) {
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false

			this.file = event?.target?.files?.[0] || null
			if (!this.file) return

			if (!this.file.name.toLowerCase().endsWith(".json")) {
				this.errormsg = "Le fichier doit être un .json"
				this.errored = true
				this.jsonToSend = null
				return
			}

			const reader = new FileReader()

			reader.onload = (res) => {
				try {
					const text = res?.target?.result ?? ""
					this.jsonToSend = JSON.parse(text)
				} catch (e) {
					this.jsonToSend = null
					this.errormsg = "JSON invalide"
					this.errored = true
				}
			}

			reader.onerror = (err) => {
				this.jsonToSend = null
				this.errormsg = err?.message || String(err)
				this.errored = true
			}

			reader.readAsText(this.file)
		},

		async onSubmit() {
			this.loadingimport = true
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false

			try {
				if (!this.jsonToSend) {
					throw new Error("No JSON to import (missing or invalid file).")
				}

				await this.$api.generic.post("templates/", this.jsonToSend)

				this.importwithsuccess = true
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
				this.importwithsuccess = false
			} finally {
				this.loadingimport = false
			}
		},
	}
}
</script>