<template>
	<div id="netdevice-modal">
		<button 
			:title="$t('network.editnetdevice')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="netdevicemodal"
			:title="$t('network.editnetdevice')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ row.ip }} - {{ row.mac }}
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
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
							label-for="netname"
						>
							<b-form-input
								id="netname"
								v-model="row.netname"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-form-input
						id="ip"
						v-model="row.ip"
						hidden
					/>
					<b-form-input
						id="mac"
						v-model="row.mac"
						hidden
					/>
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
	name: 'NetdeviceModal',
	props: {
		id: { type: Number, default: null }
	},
	emits: ['reloadDatatable'],
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				netname: null,
				ip: null,
				mac: null
			},
			netdevicemodal: false,
			idmodal: 'edit-netdevice'+this.id,
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.netdevicemodal = false
				this.createwithsuccess = false
				this.row = {
					netname: null,
					ip: null,
					mac: null
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
			this.netdevicemodal = true

			this.row = {
				netname: null,
				ip: null,
				mac: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			this.getNetdevice(id)
		},

		async getNetdevice(id) {
			try {
				const data = await this.$api.generic.get(`netdevices/${id}/`)
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

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				await this.$api.generic.patch(
					`netdevices/${this.row.id}/`,
					this.row
				)

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
