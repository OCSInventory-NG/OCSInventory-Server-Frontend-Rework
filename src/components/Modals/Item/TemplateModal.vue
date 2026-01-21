<template>
	<div id="template-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addtemplate')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addtemplate') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('template.editname')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="templatemodal" 
			v-model="templatemodal"
			:title="(!update) ? $t('template.addtemplate') : $t('template.editname')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addtemplate') : $t('template.editname') }}
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
				<b-row v-if="!update">
					<b-col>
						<b-form-group
							:label="$t('inventory.os')" 
							label-for="os"
						>
							<v-select
								id="os"
								v-model="row.os" 
								:options="options" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
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
	name: "TemplateModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: [String, Number], default: null }
	},
	data() {
		return {
			row: {
				name: null,
				sections: [],
				id: null,
				os: null,
				is_protected: false,
				last_update: null,
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			templatemodal: false,
			options: [
				{ value: 'WIN', text: this.$t('template.WIN') },
				{ value: 'DEB', text: this.$t('template.LIN')+' ('+this.$t('template.DEB')+')' },
				{ value: 'RHEL', text: this.$t('template.LIN')+' ('+this.$t('template.RHEL')+')' },
				{ value: 'MAC', text: this.$t('template.MAC') }
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.templatemodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					sections: [],
					id: null,
					os: null,
					is_protected: false,
					last_update: null,
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
		loadData(id) {
			this.templatemodal = true
			this.row = {
				name: null,
				sections: [],
				id: null,
				os: null,
				is_protected: false,
				last_update: null,
			}

			if (id) {
				this.loading = true
				this.getTemplateName(id);
			}
		},
		async getTemplateName(id){
			try {
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE + "templates/" + id + "/",
					{ headers: this.header }
				)
				this.row = response.data
			} catch (e) {
				this.errored = true
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
			} finally {
				this.loading = false
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
			}else{
				axios.patch(
					this.$config.BACKEND_API_ROUTE + "templates/" + this.id + "/",
					{name: this.row.name},
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
					})
					.catch(e => {
						this.createerror = true
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
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