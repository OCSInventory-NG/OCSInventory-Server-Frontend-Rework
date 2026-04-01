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
			modal-class="custom-modal"
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
export default {
	name: "ActionListModal",
	props: {
		package: { type: String, default: null },
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
				id: null,
				name: null,
				priority: 1,
				action_type: "EXEC",
				command: null,
				original_file_name: null
			},
			actionlistmodal: false,
			actionoptions: [
				{ value: 'EXEC', text: this.$t('deployment.EXEC') },
				{ value: 'LAUNCH', text: this.$t('deployment.LAUNCH') },
				{ value: 'STORE', text: this.$t('deployment.STORE') }
			],
			
			loading: true,
			loadingcreate: false,
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
				original_file_name: null,
				package: this.package,
				uploaded_file: null,
			}
			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getAction(id)
			}
		},

		async getAction(id) {
			try {
				const data = await this.$api.generic.get(`deployment/actions/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		processFile(event) {
			this.row.uploaded_file = event?.target?.files?.[0] || null
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			try {
				const payload = { ...(this.row || {}) }

				if (!payload.uploaded_file) {
					delete payload.uploaded_file
					payload.original_file_name = null
				} else {
					payload.original_file_name = payload.uploaded_file?.name || null
				}

				if (!(payload.uploaded_file instanceof File)) {
					delete payload.uploaded_file
					delete payload.original_file_name
				}

				delete payload.file

				const formdata = new FormData()
				for (const [key, value] of Object.entries(payload)) {
					if (value !== undefined) formdata.append(key, value)
				}

				if (!this.update) {
					await this.$api.generic.post("deployment/actions/", formdata)
				} else {
					await this.$api.generic.patch(`deployment/actions/${payload.id}/`, formdata)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createerrormsg = e?.response?.data?.error || e?.message || String(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>