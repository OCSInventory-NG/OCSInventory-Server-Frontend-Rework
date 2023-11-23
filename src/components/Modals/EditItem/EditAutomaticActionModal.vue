<template>
	<div id="edit-automatic-action-modal">
		<button 
			v-b-modal="idmodal"
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
			:title="$t('scheduler.editscheduler')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('scheduler.editscheduler') }}
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '@/i18n'

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
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			active: [
				{ value: true, text: i18n.t('generic.yes') },
				{ value: false, text: i18n.t('generic.no') }
			],
			recurences: [
				{ value: 'hourly', text: i18n.t('scheduler.hourly') },
				{ value: 'daily', text: i18n.t('scheduler.daily') },
				{ value: 'weekly', text: i18n.t('scheduler.weekly') },
				{ value: 'monthly', text: i18n.t('scheduler.monthly') }
			],
			idmodal: 'edit-scheduler.'+this.id
		}
	},
	methods: {
		loadData(id) {
			this.getScheduler(id)
		},
		getScheduler(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"automation/scheduler/"+id, { headers: this.header })
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
			
			Axios.put(process.env.VUE_APP_API_ROUTE+"automation/scheduler/"+this.row.id+"/",
				formdata, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-scheduler.'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-scheduler.'+this.row.id)
				})
		},
	}
}
</script>
