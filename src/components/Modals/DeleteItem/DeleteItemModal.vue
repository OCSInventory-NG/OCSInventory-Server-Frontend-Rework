<template>
	<div id="DeleteItemModal">
		<button 
			:title="$t('generic.deleteitem')"
			class="btn btn-ghost-danger"
			@click="deleteact = !deleteact"
		>
			<font-awesome-icon 
				:icon="['fas', 'trash-can']"
			/>
		</button>

		<b-modal 
			:id="idModal" 
			v-model="deleteact"
			:title="$t('generic.deleteitem')"
			hide-footer
			modal-class="modal modal-blur"
			size="sm"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('generic.deleteitem') }}
					<b-spinner 
						v-if="loadingdelete"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="deletewithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="deleteerror"
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
			<b-form
				@submit="onSubmit"
			>
				<Alert 
					v-if="deleteerror"
					:message="deleteerrormsg" 
					variant="danger"
				/>
				<div class="text-center">
					<font-awesome-icon 
						:icon="['fas', 'triangle-exclamation']"
						size="5x"
						color="#d63939"
					/>
					<p><b>{{ $t('message.deletevalid') }}</b></p>
					<p>{{ $t('message.delete_msg') }} {{ name }} ?</p>
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
								{{ $t('generic.delete_msg2') }}
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
import Alert from '@/components/Alert/Alert.vue'

export default {
	name: 'DeleteItemModal',
	components: { Alert },
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
			loadingdelete: false,
			deleteerror: false,
			deleteerrormsg: null,
			deletewithsuccess: false,
			deleteact: false,
			idModal: 'delete-item'+this.id,
			text: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		deletewithsuccess: function() {
			setTimeout(() => {
				this.deleteact = false
				this.deletewithsuccess = false
				this.$emit('reloadDatatable')
				this.$emit('reloadTemplate')
			}, 500)
		}
	},
	methods: {
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingdelete = true
			
			Axios.delete(import.meta.env.VITE_APP_API_ROUTE+this.parameter+"/"+this.row.id+"/", { headers: this.header })
				.then(() => {
					this.deleteerrormsg = null
					this.deleteerror = false
					this.deletewithsuccess = true
				})
				.catch(e => {
					this.deleteerrormsg = e.message
					this.deleteerror = true
					this.deletewithsuccess = false
				})
				.finally(() => this.loadingdelete = false)
		}
	}
}
</script>