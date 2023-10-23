<template>
	<div id="edit-netdevice-modal">
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
			:title="$t('network.editnetdevice')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ row.ip }} - {{ row.mac }}
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
			<b-form
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'

export default {
	name: 'EditNetdeviceModal',
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
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idmodal: 'edit-netdevice'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		loadData(id) {
			this.getNetdevice(id)
		},
		// Retrieve networks info by id
		getNetdevice(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"netdevices/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.$bvModal.show('edit-netdevice'+id)
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// Submit edit netdevice creation and call refresh datatable to reload
		onSubmit(event) {
			event.preventDefault()
			
			Axios.patch(process.env.VUE_APP_API_ROUTE+"netdevices/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-netdevice'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-netdevice'+this.row.id)
				})
		},
	}
}
</script>
