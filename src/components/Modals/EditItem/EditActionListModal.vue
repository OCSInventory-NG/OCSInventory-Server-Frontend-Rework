<template>
	<div id="edit-action-list-modal">
		<button 
			v-b-modal="idmodal"
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
			:title="$t('deployment.editaction')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('deployment.editaction') }}
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
							:label="$t('deployment.priority')" 
							label-for="priority"
						>
							<b-form-input
								id="priority"
								v-model="row.priority"
								type="number"
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '@/i18n'

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
				priority: 1,
				action_type: "EXEC",
				command: null,
				file: ''
			},
			rowdata: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			actionoptions: [
				{ value: 'EXEC', text: i18n.t('deployment.EXEC') },
				{ value: 'LAUNCH', text: i18n.t('deployment.LAUNCH') },
				{ value: 'STORE', text: i18n.t('deployment.STORE') }
			],
			idmodal: 'edit-action.'+this.id
		}
	},
	methods: {
		loadData(id) {
			this.getAction(id)
		},
		processFile(event){
			this.row.file = event.target.files[0];
		},
		getAction(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"deployment/actions/"+id, { headers: this.header })
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

			let formdata = new FormData()

			Object.keys(this.row).forEach(key => {
				formdata.append(key, this.row[key])
			})
			
			Axios.put(process.env.VUE_APP_API_ROUTE+"deployment/actions/"+this.row.id+"/", formdata, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-action.'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-action.'+this.row.id)
				})
		},
	}
}
</script>
