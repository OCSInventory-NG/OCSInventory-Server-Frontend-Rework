<template>
	<div id="automation-modal">
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
						@click="loadData()"
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
			id="automationmodal" 
			v-model="automationmodal"
			:title="(!update) ? $t('scheduler.addscheduler') : $t('scheduler.editscheduler')"
			hide-footer
			modal-class="custom-modal"
			
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
				v-if="!update"
				:message="$t('scheduler.creation_warning')"
				variant="warning"
			/>
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
							<div class="form-check form-switch">
								<input 
									v-model="row.active"
									class="form-check-input"
									type="checkbox"
								>
							</div>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('scheduler.recurrence')" 
							label-for="recurrence"
						>
							<v-select
								id="recurrence"
								v-model="row.recurrence" 
								:options="recurrences" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								@option:selected="cleanRow()"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="row.recurrence == 'weekly'">
					<b-col>
						<b-form-group
							:label="$t('scheduler.day_of_week')" 
							label-for="day_of_week"
						>
							<v-select
								id="day_of_week"
								v-model="row.day_of_week" 
								:options="days" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="row.recurrence == 'monthly'">
					<b-col>
						<b-form-group
							:label="$t('scheduler.day_of_month')" 
							label-for="day_of_month"
						>
							<b-form-input
								id="day_of_month"
								v-model="row.day_of_month"
								type="number"
								min="1"
								max="31"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="row.recurrence != 'hourly'">
					<b-col>
						<b-form-group
							:label="$t('scheduler.hour')" 
							label-for="hour"
						>
							<b-form-input
								id="hour"
								v-model="row.hour"
								type="time"
								step="60"
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
export default {
	name: "AutomationModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				name: null,
				description: null,
				active: false,
				recurrence: "daily",
				hour: null,
				day_of_week: null,
				day_of_month: null
			},
			automationmodal: false,
			recurrences: [
				{ value: 'hourly', text: this.$t('scheduler.hourly') },
				{ value: 'daily', text: this.$t('scheduler.daily') },
				{ value: 'weekly', text: this.$t('scheduler.weekly') },
				{ value: 'monthly', text: this.$t('scheduler.monthly') }
			],
			days: [
				{ value: 0, text: this.$t('scheduler.monday') },
				{ value: 1, text: this.$t('scheduler.tuesday') },
				{ value: 2, text: this.$t('scheduler.wednesday') },
				{ value: 3, text: this.$t('scheduler.thursday') },
				{ value: 4, text: this.$t('scheduler.friday') },
				{ value: 5, text: this.$t('scheduler.saturday') },
				{ value: 6, text: this.$t('scheduler.sunday') }
			],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.automationmodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null,
					active: false,
					recurrence: "daily",
					hour: null,
					day_of_week: null,
					day_of_month: null
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
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.automationmodal = true
			this.row = {
				name: null,
				description: null,
				active: false,
				recurrence: "daily",
				hour: null,
				day_of_week: null,
				day_of_month: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getScheduler(id)
			}
		},

		async getScheduler(id) {
			try {
				const data = await this.$api.generic.get(`automation/scheduler/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		cleanRow() {
			this.row.hour = null
			this.row.day_of_week = null
			this.row.day_of_month = null
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("automation/scheduler/", this.row)
				} else {
					await this.$api.generic.patch(
						`automation/scheduler/${this.row.id}/`,
						this.row
					)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>