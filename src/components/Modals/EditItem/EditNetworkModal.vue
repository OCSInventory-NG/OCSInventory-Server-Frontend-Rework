<template>
	<div id="edit-network-modal">
		<button 
			:title="$t('editnetwork')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			:title="$t('editnetwork')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ row.netid }} - {{ row.mask }}
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
							:label="$t('name')" 
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
							:label="$t('description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="row.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('netgroup')" 
							label-for="netgroup"
						>
							<b-form-select
								id="netgroup"
								v-model="row.group" 
								:options="netgroup" 
								class="mb-3 form-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-form-input
						id="netid"
						v-model="row.netid"
						hidden
					/>
					<b-form-input
						id="mask"
						v-model="row.mask"
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
							{{ $t('save') }}
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
import i18n from '../../../i18n'

export default {
	name: 'EditNetworkModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				netid: null,
				mask: null,
				group: null
			},
			netgroup: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idmodal: 'edit-network'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		loadData(id) {
			this.getNetworks(id)
		},
		// Retrieve networks info by id
		getNetworks(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"networks/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.getNetGroup(id)
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getNetGroup(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"netgroups/", { headers: this.header })
				.then(response => {
					this.netgroup.push({
						value: null,
						text: i18n.t("unknown_network")
					})
					response.data.forEach(element => {
						this.netgroup.push({
							value: element.id,
							text: element.name
						})
					});
					this.errorMsg = null
					this.errored = false
					this.$bvModal.show('edit-network'+id)
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// Submit edit network creation and call refresh datatable to reload
		onSubmit(event) {
			event.preventDefault()
			
			Axios.put(process.env.VUE_APP_API_ROUTE+"networks/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-network'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-network'+this.row.id)
				})
		},
	}
}
</script>
