<template>
	<div id="compliance-type-modal">
		<div
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('compliance.add_type')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon
							:icon="['fas', 'plus']"
						/>
						{{ $t('compliance.add_type') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button
				:title="$t('compliance.edit_type')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>

		<b-modal
			id="compliancetypemodal"
			v-model="compliancetypemodal"
			:title="(!update) ? $t('compliance.add_type') : $t('compliance.edit_type')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('compliance.add_type') : $t('compliance.edit_type') }}
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
							:label="$t('compliance.type_name')"
							label-for="type-name"
						>
							<b-form-input
								id="type-name"
								v-model="row.name"
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
	name: "ComplianceTypeModal",
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
				name: null,
			},
			compliancetypemodal: false,

			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.compliancetypemodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
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
			this.compliancetypemodal = true
			this.row = {
				name: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				try {
					const data = await this.$api.generic.get(`compliance/types/${id}/`)
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
					await this.$api.generic.post("compliance/types/", this.row)
				} else {
					await this.$api.generic.patch(`compliance/types/${this.row.id}/`, this.row)
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
