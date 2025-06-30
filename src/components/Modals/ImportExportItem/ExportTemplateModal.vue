<template>
	<div id="export-template-modal">
		<b-button 
			:title="$t('template.export_template')"
			variant="bg-light"
			class="form-control btn datatable-btn datatable-btn-maxsize"
			@click="refreshIds()"
		>
			<font-awesome-icon 
				:icon="['fas', 'upload']"
			/>
		</b-button>

		<b-modal 
			id="export-template" 
			v-model="exporttemplate"
			:title="$t('template.export_template')"
			hide-footer
			size="md"
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.export_template') }}
					<b-spinner 
						v-if="loadingexport"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="exportwithsuccess"
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
				<Alert
					v-if="!templatetoexport.length"
					:message="$t('message.no_template_selection')"
					variant="warning"
				/>
				<b-row v-else>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ $t('generic.download') }}
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
	name: 'ExportTemplateModal',
	props: {
		ids: { type: Array, default: () => [] },
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			exporttemplate: false,
			loadingexport: false,
			exportwithsuccess: false,
			templatetoexport: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		exportwithsuccess: function() {
			setTimeout(() => {
				this.exportwithsuccess = false
				this.exporttemplate = false
			}, 2000)
		}
	},
	methods: {
		refreshIds() {
			this.templatetoexport = this.ids
			this.exporttemplate = true
		},
		async onSubmit(event) {
			event.preventDefault()
			this.loadingexport = true
			this.errored = false
			this.exportwithsuccess = false

			for (const id of this.templatetoexport) {
				try {
					const response = await axios.get(
						this.$config.BACKEND_API_ROUTE + 'templates/' + id + '?expand=*',
						{ headers: this.header }
					)

					const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
					const url = window.URL.createObjectURL(blob)
					const link = document.createElement('a')
					link.href = url
					link.download = response.data.name + '.json'

					document.body.appendChild(link)
					link.click()

					document.body.removeChild(link)
					window.URL.revokeObjectURL(url)
				} catch (error) {
					this.errormsg = error.message
					this.errored = true
				}
			}

			if (!this.errored) {
				this.exportwithsuccess = true
				this.loadingexport = false
			}
		}
	}
}
</script>