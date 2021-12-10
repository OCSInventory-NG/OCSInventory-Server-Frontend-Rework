<template>
	<div id="EditAccountinfoModal">
		<b-button 
			v-b-modal="idModal"
			:title="$t('editaccountinfo')"
			variant="primary"
			class="add-button"
		>
			<b-icon 
				icon="pencil-square" 
				aria-hidden="true"
			/>
		</b-button>

		<b-modal 
			:id="idModal"
			:title="$t('editaccountinfo')"
			hide-footer
			modal-class="custom-modal"
		>
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
					<b-col align-self="start"/>
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
					<b-col align-self="end"/>
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'

export default {
	name: 'EditAccountinfoModal',
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
			idModal: 'edit-accountinfo'+this.id
		}
	},
	created() {
		this.getAccountinfo()	
	},
	methods: {
		// Get accountinfo
		getAccountinfo() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			Axios.get(process.env.VUE_APP_API_ROUTE+"accountinfo/config/"+this.id+"/", { headers: header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		// Submit edit accountinfo creation and call refresh edit template to reload
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			
			var update = {
				name: this.row.name,
				description: this.row.description
			}

			Axios.put(process.env.VUE_APP_API_ROUTE+"accountinfo/config/"+this.row.id+"/", update, { headers: header })
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
