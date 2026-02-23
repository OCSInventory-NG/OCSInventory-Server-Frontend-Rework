<template>
	<div id="mapping-modal">
		<button 
			:title="$t('authentication.editmapping')"
			class="btn btn-ghost-orange ocs-auto"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'gear']"
				size="1x"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="mappingmodal"
			:title="$t('authentication.editmapping')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('authentication.editmapping') }}
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
				v-if="createerror"
				:message="createerrormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row
					v-for="(row, index) in rows"
					:key="index"
				>
					<b-col>
						<b-form-group
							:label="$t('user.'+index)" 
							:label-for="index"
						>
							<b-form-input
								:id="index"
								v-model="rows[index]"
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
export default {
	name: 'MappingModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			rows: {
				username: null,
				last_name: null,
				first_name: null,
				email: null
			},
			mapping: [],
			mappingmodal: false,
			idmodal: 'edit-mapping.'+this.id,
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.mappingmodal = false
				this.createwithsuccess = false
				this.rows = {
					username: null,
					last_name: null,
					first_name: null,
					email: null
				}
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.loading = true
			this.mappingmodal = true

			this.rows = {
				username: null,
				last_name: null,
				first_name: null,
				email: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			this.getMappingConfig(id)
		},

		async getMappingConfig(id) {
			try {
				const data = await this.$api.generic.get("auth_mapping/", { auth_config: id })
				this.mapping = data || []

				if (this.mapping.length) {
					this.mapping.forEach((map) => {
						if (map.internal_field in this.rows) {
							this.rows[map.internal_field] = map.external_field
						}
					})
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
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
				const jsonToUpdate = []
				const jsonToAdd = []
				const jsonToDelete = []

				if (this.mapping?.length) {
					this.mapping.forEach((map) => {
						if (map.internal_field in this.rows) {
							const value = this.rows[map.internal_field]

							if (value !== "" && value !== null && value !== undefined) {
								jsonToUpdate.push({
									id: map.id,
									auth_config: this.id,
									internal_field: map.internal_field,
									external_field: value,
								})
							} else {
								jsonToDelete.push({ id: map.id })
							}
						}
					})
				}

				Object.keys(this.rows).forEach((row) => {
					const value = this.rows[row]
					if (value !== "" && value !== null && value !== undefined) {
						const exists = this.mapping?.some((map) => map.internal_field === row)
						if (!exists) {
							jsonToAdd.push({
								auth_config: this.id,
								internal_field: row,
								external_field: value,
							})
						}
					}
				})

				if (!jsonToUpdate.length && !jsonToAdd.length && !jsonToDelete.length) {
					this.createwithsuccess = true
					return
				}

				// PATCH
				if (jsonToUpdate.length) {
					await Promise.all(
						jsonToUpdate.map((payload) =>
							this.$api.generic.patch(`auth_mapping/${payload.id}/`, payload)
						)
					)
				}

				// POST
				if (jsonToAdd.length) {
					await this.$api.generic.post("auth_mapping/", jsonToAdd)
				}

				// DELETE
				if (jsonToDelete.length) {
					await Promise.all(
						jsonToDelete.map((payload) =>
							this.$api.generic.delete(`auth_mapping/${payload.id}/`)
						)
					)
				}

				this.createwithsuccess = true
				this.createerror = false
				this.createerrormsg = null
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
