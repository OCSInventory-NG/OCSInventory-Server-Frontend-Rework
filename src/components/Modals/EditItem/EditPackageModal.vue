<template>
	<div id="edit-package-modal">
		<button 
			:title="$t('deployment.editpackage')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="editpackage"
			:title="$t('deployment.editpackage')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('deployment.editpackage') }}
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
							:label="$t('deployment.description')" 
							label-for="name"
						>
							<b-form-input
								id="description"
								v-model="row.description"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('deployment.target_os')" 
							label-for="target_os"
						>
							<b-form-select
								id="target_os"
								v-model="row.target_os" 
								:options="options" 
								class="mb-3 form-select"
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
				name: null,
				description: null,
				target_os: null
			},
			loading: true,
			errorMsg: null,
			errored: false,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			editpackage: false,
			idmodal: 'edit-package.'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			options: [
				{ value: 'WIN', text: this.$t('template.WIN') },
				{ value: 'LIN', text: this.$t('template.LIN') },
				{ value: 'MAC', text: this.$t('template.MAC') }
			]
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editpackage = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.editpackage = true
			this.getPackages(id)
		},
		getPackages(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/"+id, { headers: this.header })
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

			delete this.row.actions_list
			delete this.row.result
			
			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/"+this.row.id+"/", this.row,
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
