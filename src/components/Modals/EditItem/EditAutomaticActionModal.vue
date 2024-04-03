<template>
	<div id="edit-automatic-action-modal">
		<button 
			:title="$t('scheduler.editscheduler')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="editscheduler"
			:title="$t('scheduler.editscheduler')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('scheduler.editscheduler') }}
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
							:label="$t('scheduler.name')" 
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
							:label="$t('scheduler.description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="row.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('scheduler.active')" 
							label-for="active"
						>
							<b-form-select
								id="active"
								v-model="row.active" 
								:options="active" 
								class="mb-3 form-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('scheduler.recurence')" 
							label-for="recurence"
						>
							<b-form-select
								id="recurence"
								v-model="row.recurence" 
								:options="recurences" 
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
	name: 'EditAutomaticActionModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				active: false,
				recurence: "hourly"
			},
			rowdata: [],
			errorMsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			editscheduler: false,
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			active: [
				{ value: true, text: this.$t('generic.yes') },
				{ value: false, text: this.$t('generic.no') }
			],
			recurences: [
				{ value: 'hourly', text: this.$t('scheduler.hourly') },
				{ value: 'daily', text: this.$t('scheduler.daily') },
				{ value: 'weekly', text: this.$t('scheduler.weekly') },
				{ value: 'monthly', text: this.$t('scheduler.monthly') }
			],
			idmodal: 'edit-scheduler.'+this.id
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editscheduler = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.editscheduler = true
			this.getScheduler(id)
		},
		getScheduler(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/"+id, { headers: this.header })
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
			
			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/"+this.row.id+"/",
				this.row, { headers: this.header })
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
