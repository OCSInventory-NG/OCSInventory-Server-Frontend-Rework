<template>
	<div id="snmp-template-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('network.addsnmptemplate')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('network.addsnmptemplate') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('network.editsnmptemplate')"
				class="btn btn-ghost-dark"
				@click="loadData()"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="snmptemplatemodal" 
			v-model="snmptemplatemodal"
			:title="(!update) ? $t('network.addsnmptemplate') : $t('network.editsnmptemplate')"
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('network.addsnmptemplate') : $t('network.editsnmptemplate') }}
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
							:label="$t('network.name')" 
							label-for="templatename"
						>
							<b-form-input
								id="templatename"
								v-model="row.name"
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
	name: "SnmpTemplateModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				os: 'SNMP',
				sections: []
			},
			loading: true,
			errormsg: null,
			errored: false,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			snmptemplatemodal: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.snmptemplatemodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					os: 'SNMP',
					sections: []
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		loadData() {
			this.snmptemplatemodal = true
			this.row = {
				name: null,
				os: 'SNMP',
				sections: []
			}
			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null

			if (this.update) {
				this.loading = true
			}
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"templates/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => {
						this.loadingcreate = false
					})
			}			
		}
	}
}
</script>