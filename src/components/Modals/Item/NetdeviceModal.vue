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
			modal-class="custom-modal modal-blur"
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
import axios from 'axios'

export default {
	name: 'NetdeviceModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				netname: null,
				ip: null,
				mac: null
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			netdevicemodal: false,
			idmodal: 'edit-netdevice'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
		loadData(id) {
			this.loading = true
			this.netdevicemodal = true
			this.getNetdevice(id)
		},
		// Retrieve networks info by id
		async getNetdevice(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"netdevices/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit edit netdevice creation and call refresh datatable to reload
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			axios.patch(this.$config.BACKEND_API_ROUTE+"netdevices/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				})
				.catch(e => {
					this.createerrormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.createerror = true
					this.createwithsuccess = false
				})
				.finally(() => this.loadingcreate = false)
		},
	}
}
</script>
