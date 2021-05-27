<template>
	<div id="DeleteItemModal">
		<b-button 
			v-b-modal="idModal"
			:title="$t('deleteitem')"
			variant="danger"
		>
			<b-icon 
				icon="x" 
				aria-hidden="true"
			/>
		</b-button >

		<b-modal 
			:id="idModal" 
			:title="$t('deleteitem')"
			hide-footer
			modal-class="custom-modal"
		>
			<b-form
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<p>{{ $t("delete_msg") }} {{ name }} ?</p>
						<b-form-input 
							v-model="text" 
							hidden
						>{{ id }}</b-form-input>
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
							{{ $t('yes') }}
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

const header = {
	"Content-Type": "application/json;charset=utf-8",
	"Authorization": 'Token ' + localStorage.getItem('token_authentication')
}

export default {
	name: 'DeleteItemModal',
	props: {
		id: { type: Number, default: null },
		name: { type: String, default: '' },
		parameter: { type: String, default: '' }
	},
	data() {
		return {
			row: {
				id: this.id
			},
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'delete-item'+this.id,
			text: null,
		}
	},
	methods: {
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			Axios.delete("http://172.18.26.12:8000/"+this.parameter+"/"+this.row.id+"/", { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('delete-item'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('delete-item'+this.row.id)
				})
		}
	}
}
</script>