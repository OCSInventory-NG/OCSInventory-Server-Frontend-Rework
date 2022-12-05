<template>
	<div id="edit-accountinfo-modal">
		<button 
			:title="$t('editaccountinfo')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idModal"
			:title="$t('editaccountinfo')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('editaccountinfo') }}
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
				</b-row><b-row>
					<b-col>
						<b-form-group
							:label="$t('description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="row.description"
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

export default {
	name: "EditAccountinfoModal",
	props: {
		id: { type: Number, required: true },
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				description: null
			},
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'edit-accountinfo'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		loadData(id) {
			this.getAccountinfo(id)
		},
		// Get accountinfo
		getAccountinfo(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"accountinfo/config/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.$bvModal.show('edit-accountinfo'+id)
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		// Submit edit accountinfo creation and call refresh edit template to reload
		onSubmit(event) {
			event.preventDefault()
			
			var update = {
				name: this.row.name,
				description: this.row.description
			}

			Axios.put(process.env.VUE_APP_API_ROUTE+"accountinfo/config/"+this.row.id+"/", update, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-accountinfo'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-accountinfo'+this.row.id)
				})
		},
	}
}
</script>