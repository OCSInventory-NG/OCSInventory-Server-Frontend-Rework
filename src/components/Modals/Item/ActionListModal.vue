<template>
	<div id="action-list-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('deployment.addaction')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('deployment.addaction') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('deployment.editaction')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="actionlistmodal" 
			v-model="actionlistmodal"
			:title="(!update) ? $t('deployment.addaction') : $t('deployment.editaction')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('deployment.addaction') : $t('deployment.editaction') }}
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
							:label="$t('deployment.name')" 
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
							:label="$t('deployment.action_type')" 
							label-for="action_type"
						>
							<v-select
								id="action_type"
								v-model="row.action_type" 
								:options="actionoptions" 
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
							:label="row.action_type == 'STORE' ? 
								$t('deployment.path') : $t('deployment.command')" 
							label-for="command"
						>
							<b-form-input
								id="command"
								v-model="row.command"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row
					v-if="row.action_type == 'STORE' || row.action_type == 'LAUNCH'"
				>
					<b-col>
						<b-form-file
							id="uploaded_file"
							:placeholder="row.action_type == 'LAUNCH' ? 
								$t('deployment.select_launch_file') : $t('deployment.select_store_file')"
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
	name: "ActionListModal",
	props: {
		package: { type: String, default: null },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				priority: 1,
				action_type: "EXEC",
				command: null,
				original_file_name: null
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			actionlistmodal: false,
			actionoptions: [
				{ value: 'EXEC', text: this.$t('deployment.EXEC') },
				{ value: 'LAUNCH', text: this.$t('deployment.LAUNCH') },
				{ value: 'STORE', text: this.$t('deployment.STORE') }
			],
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.actionlistmodal = false
				this.createwithsuccess = false
				this.row = {
					id: null,
					name: null,
					priority: 1,
					action_type: "EXEC",
					command: null,
					original_file_name: null
				}
				if(this.update) {
					this.$emit('reloadDatatable')
				} else {
					this.$emit('reloadPackage')
				}
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.row.package = this.package
			this.loading = false
		}
	},
	methods: {
		loadData(id) {
			this.actionlistmodal = true
			this.row = {
				id: null,
				name: null,
				priority: 1,
				action_type: "EXEC",
				command: null,
				original_file_name: null
			}
			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null

			if (id) {
				this.loading = true
				this.getAction(id)
			}
		},
		async getAction(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"deployment/actions/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		processFile(event){
			this.row.uploaded_file = event.target.files[0];
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(!this.row.uploaded_file) {
				delete this.row.uploaded_file
				this.row.original_file_name = null
			} else {
				this.row.original_file_name = this.row.uploaded_file.name
			}

			if(!(this.row.uploaded_file instanceof Object)) {
				delete this.row.uploaded_file
				delete this.row.original_file_name 
			}

			delete this.row.file

			let formdata = new FormData()

			Object.keys(this.row).forEach(key => {
				formdata.append(key, this.row[key])
			})
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"deployment/actions/", formdata, { headers: this.header })
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
					.finally(() => this.loadingcreate = false)
			} else {
				axios.patch(this.$config.BACKEND_API_ROUTE+"deployment/actions/"+this.row.id+"/", formdata,
					{ headers: this.header })
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
					.finally(() => this.loadingcreate = false)
			}			
		}
	}
}
</script>