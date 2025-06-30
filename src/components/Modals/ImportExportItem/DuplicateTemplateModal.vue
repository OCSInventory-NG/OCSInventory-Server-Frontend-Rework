<template>
	<div id="duplicate-template-modal">
		<b-button 
			:title="$t('template.duplicate_template')"
			variant="bg-light"
			class="form-control btn datatable-btn datatable-btn-maxsize"
			@click="refresh()"
		>
			<font-awesome-icon 
				:icon="['fas', 'copy']"
			/>
		</b-button>

		<b-modal 
			id="export-template" 
			v-model="duplicatetemplate"
			:title="$t('template.duplicate_template')"
			hide-footer
			size="md"
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.duplicate_template') }}
					<b-spinner 
						v-if="loadingduplicate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="duplicatewithsuccess"
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
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="errored"
					:message="errormsg" 
					variant="danger"
				/>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('title.template')" 
							label-for="template"
						>
							<v-select
								id="template"
								v-model="selected" 
								:options="templateopt" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="selected != null">
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="duplicatename"
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
							{{ $t('generic.duplicate') }}
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
	name: 'DuplicateTemplateModal',
	data() {
		return {
			errormsg: null,
			errored: false,
			loading: true,
			duplicatetemplate: false,
			loadingduplicate: false,
			duplicatewithsuccess: false,
			duplicatename: null,
			templateopt: [],
			selected: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		duplicatewithsuccess: function() {
			setTimeout(() => {
				this.duplicatewithsuccess = false
				this.duplicatetemplate = false
				this.duplicatename = null
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		async refresh() {
			this.loading = true
			this.duplicatetemplate = true
			this.selected = null
			this.duplicatename = null
			await this.getTemplate()
		},
		async getTemplate() {
			this.templateopt = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					for (const temp of response.data) {
						if(temp.os != "SNMP") {
							this.templateopt.push({
								value: temp.id,
								text: temp.name
							})
						}
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async onSubmit(event) {
			event.preventDefault()
			this.loadingduplicate = true

			var template = {}
			
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/"+this.selected+"?expand=*",
				{ headers: this.header })
				.then(response => {
					template = response.data
					template.name = this.duplicatename
					template.is_protected = false
					this.errored = false
					this.errormsg = null
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})

			if(template) {
				await axios.post(this.$config.BACKEND_API_ROUTE+"templates/", template, { headers: this.header })
					.then(() => {
						this.errored = false
						this.errormsg = null
						this.loadingduplicate = false
						this.duplicatewithsuccess = true
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
						this.duplicatewithsuccess = false
					})
			}
		}
	}
}
</script>