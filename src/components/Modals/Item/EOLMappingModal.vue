<template>
	<div id="eol-mapping-modal">
		<div
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('compliance.add_eol_mapping')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon
							:icon="['fas', 'plus']"
						/>
						{{ $t('compliance.add_eol_mapping') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button
				:title="$t('compliance.edit_eol_mapping')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>

		<b-modal
			id="eolmappingmodal"
			v-model="eolmappingmodal"
			:title="(!update) ? $t('compliance.add_eol_mapping') : $t('compliance.edit_eol_mapping')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('compliance.add_eol_mapping') : $t('compliance.edit_eol_mapping') }}
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
							:label="$t('compliance.eol_product')"
							label-for="eol-product"
						>
							<b-form-input
								id="eol-product"
								v-model="row.product"
								:placeholder="$t('compliance.eol_product_placeholder')"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('compliance.eol_cycle')"
							label-for="eol-cycle"
						>
							<b-form-input
								id="eol-cycle"
								v-model="row.cycle"
								:placeholder="$t('compliance.eol_cycle_placeholder')"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('compliance.eol_is_extended')"
							label-for="eol-is-extended"
						>
							<b-form-checkbox
								id="eol-is-extended"
								v-model="row.is_extended"
								switch
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
	name: "EOLMappingModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				product: null,
				cycle: null,
				is_extended: true,
			},
			eolmappingmodal: false,

			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.eolmappingmodal = false
				this.createwithsuccess = false
				this.row = {
					product: null,
					cycle: null,
					is_extended: true,
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
			this.eolmappingmodal = true
			this.row = {
				product: null,
				cycle: null,
				is_extended: true,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				try {
					const data = await this.$api.generic.get(`compliance/eol-extended-support/${id}/`)
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
					await this.$api.generic.post("compliance/eol-extended-support/", this.row)
				} else {
					await this.$api.generic.patch(
						`compliance/eol-extended-support/${this.row.id}/`,
						this.row,
					)
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
