<template>
	<div id="automatic-action-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('scheduler.addscheduler')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="automaticactionmodal = !automaticactionmodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('scheduler.addscheduler') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('scheduler.editscheduler')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="automaticactionmodal" 
			v-model="automaticactionmodal"
			:title="(!update) ? $t('scheduler.addscheduler') : $t('scheduler.editscheduler')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('scheduler.addscheduler') : $t('scheduler.editscheduler') }}
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
								required
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
							<v-select
								id="active"
								v-model="row.active" 
								:options="active" 
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
							:label="$t('scheduler.recurence')" 
							label-for="recurence"
						>
							<v-select
								id="recurence"
								v-model="row.recurence" 
								:options="recurences" 
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
	name: "AutomaticActionModal",
	props: {
		update: { type: Boolean, default: false },
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
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			automaticactionmodal: false,
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.automaticactionmodal = false
				this.createwithsuccess = false
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
			this.loading = true
			this.automaticactionmodal = true
			this.getScheduler(id)
		},
		getScheduler(id) {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/"+id, { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			if(!this.update) {
				axios.post(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				axios.patch(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/"+this.row.id+"/",
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
			}		
		}
	}
}
</script>