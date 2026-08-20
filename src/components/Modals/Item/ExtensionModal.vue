<template>
	<div id="extension-modal">
		<div>
			<button 
				:title="$t('extensions.editextension')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="extensionmodal" 
			v-model="extensionmodal"
			:title="$t('extensions.editextension')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('extensions.editextension') }}
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
						<Alert 
							:message="$t('extensions.enable_disclaimer')" 
							variant="warning"
						/>
						<b-form-group
							:label="$t('extensions.enabled')" 
							label-for="enabled"
							label-cols="2"
						>
							<label class="form-check form-switch col-form-label">
								<input 
									v-model="row.enabled"
									class="form-check-input"
									type="checkbox"
								>
							</label>
						</b-form-group>
					</b-col>
				</b-row><br>
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
export default {
	name: "ExtensionModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: [String, Number], default: null }
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
				enabled: false
			},
			extensionmodal: false,
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.extensionmodal = false
				this.createwithsuccess = false
				this.row = {
					enabled: false
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.extensionmodal = true
			this.row = {
				enabled: false,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getExtension(id)
			}
		},

		async getExtension(id) {
			try {
				const data = await this.$api.generic.get(`extensions/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errored = true
				this.errormsg = this._apiError(e)
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				await this.$api.generic.patch(
					`extensions/${this.id}/`,
					{ enabled: this.row.enabled }
				)

				this.createwithsuccess = true
			} catch (e) {
				this.createerror = true
				this.createerrormsg = this._apiError(e)
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>