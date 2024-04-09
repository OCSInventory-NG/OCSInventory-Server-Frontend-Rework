<template>
	<div id="edit-action-list-modal">
		<button 
			:title="$t('deployment.editaction')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="editaction"
			:title="$t('deployment.editaction')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('deployment.editaction') }}
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
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="createerror"
					:message="createerrormsg" 
					variant="danger"
				/>
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
							<b-form-select
								id="action_type"
								v-model="row.action_type" 
								:options="actionoptions" 
								class="mb-3 form-select"
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
							id="file"
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
							{{ $t('generic.save') }}
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
import Axios from 'axios'

export default {
	name: 'EditPackageModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				action_type: "EXEC",
				command: null,
				file: ''
			},
			rowdata: [],
			errorMsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			editaction: false,
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			actionoptions: [
				{ value: 'EXEC', text: this.$t('deployment.EXEC') },
				{ value: 'LAUNCH', text: this.$t('deployment.LAUNCH') },
				{ value: 'STORE', text: this.$t('deployment.STORE') }
			],
			idmodal: 'edit-action.'+this.id
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editaction = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.editaction = true
			this.getAction(id)
		},
		processFile(event){
			this.row.file = event.target.files[0];
		},
		getAction(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/actions/"+id, { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit edit section creation and call refresh edit template to reload
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			let formdata = new FormData()

			Object.keys(this.row).forEach(key => {
				formdata.append(key, this.row[key])
			})
			
			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"deployment/actions/"+this.row.id+"/", formdata,
				{ headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				})
				.catch(e => {
					this.createerrormsg = e.message
					this.createerror = true
					this.createwithsuccess = false
				})
				.finally(() => this.loadingcreate = false)
		},
	}
}
</script>
