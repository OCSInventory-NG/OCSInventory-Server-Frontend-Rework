<template>
	<div id="windows-build-mapping-modal">
		<div
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('compliance.add_windows_build')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon
							:icon="['fas', 'plus']"
						/>
						{{ $t('compliance.add_windows_build') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button
				:title="$t('compliance.edit_windows_build')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>

		<b-modal
			id="windowsbuildmappingmodal"
			v-model="windowsbuildmappingmodal"
			:title="(!update) ? $t('compliance.add_windows_build') : $t('compliance.edit_windows_build')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('compliance.add_windows_build') : $t('compliance.edit_windows_build') }}
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
							:label="$t('compliance.build_number')"
							label-for="build"
						>
							<b-form-input
								id="build"
								v-model.number="row.build"
								type="number"
								min="0"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('compliance.channel')"
							label-for="channel"
						>
							<b-form-input
								id="channel"
								v-model="row.channel"
								placeholder="ex: 22h2"
								required
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
	name: "WindowsBuildMappingModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
	},
	emits: ["reloadDatatable"],
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				build: null,
				channel: null,
			},
			windowsbuildmappingmodal: false,

			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.windowsbuildmappingmodal = false
				this.createwithsuccess = false
				this.row = {
					build: null,
					channel: null,
				}
				this.$emit("reloadDatatable")
			}, 500)
		},
	},
	mounted() {
		if (!this.update) {
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData(id) {
			this.windowsbuildmappingmodal = true
			this.row = {
				build: null,
				channel: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				try {
					const data = await this.$api.generic.get(`compliance/windows-build-mapping/${id}/`)
					this.row = data
					this.errored = false
				} catch (e) {
					this.errormsg = this._apiError(e)
					this.errored = true
				} finally {
					this.loading = false
				}
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("compliance/windows-build-mapping/", this.row)
				} else {
					await this.$api.generic.patch(`compliance/windows-build-mapping/${this.row.id}/`, this.row)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createwithsuccess = false
				this.createerror = true
				this.createerrormsg = this._apiError(e)
			} finally {
				this.loadingcreate = false
			}
		},
	},
}
</script>
