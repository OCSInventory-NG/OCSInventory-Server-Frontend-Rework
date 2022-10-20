<template>
	<div id="DeleteItemModal">
		<button 
			v-b-modal="idModal"
			:title="$t('deleteitem')"
			class="btn btn-ghost-danger"
		>
			<font-awesome-icon 
				:icon="['fas', 'trash-can']"
			/>
		</button>

		<b-modal 
			:id="idModal" 
			:title="$t('deleteitem')"
			hide-footer
			modal-class="modal modal-blur"
			size="sm"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('deleteitem') }}
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
				<div class="text-center">
					<font-awesome-icon 
						:icon="['fas', 'triangle-exclamation']"
						size="5x"
						color="#d63939"
					/>
					<p><b>{{ $t('deletevalid') }}</b></p>
					<p>{{ $t('delete_msg') }} {{ name }} ?</p>
					<b-form-input 
						v-model="text" 
						hidden
					>
						{{ id }}
					</b-form-input>
				</div>
				<div class="w-100 text-center">
					<div class="row">
						<div class="col">
							<button 
								type="submit"
								class="btn btn-danger"
							>
								{{ $t('delete_msg2') }}
							</button>
						</div>
					</div>
				</div>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'

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
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			Axios.delete(process.env.VUE_APP_API_ROUTE+this.parameter+"/"+this.row.id+"/", { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('delete-item'+this.row.id)
					this.$emit('reloadDatatable')
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('delete-item'+this.row.id)
				})
		}
	}
}
</script>