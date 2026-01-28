<template>
	<div id="delete-item-modal">
		<button 
			:title="(!multiple) ?
				$t('generic.deleteitem') : $t('generic.deleteselection')"
			:class="'btn ' + customclass"
			:disabled="disabled"
			@click="refreshIds()"
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
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!multiple) ? $t('generic.deleteitem') : $t('generic.deleteselection') }}
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
				v-if="(!multiple) || (multiple && rows.ids.length > 0)"
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
			<div v-else>
				<div class="text-center">
					<font-awesome-icon
						:icon="['fas', 'triangle-exclamation']"
						size="5x"
						color="#d63939"
					/>
					<Alert
						:message="$t('message.no_selection')"
						variant="warning"
					/>
				</div>
			</div>
		</b-modal>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'DeleteItemModal',
	props: {
		id: { type: [String, Number], default: null },
		ids: { type: Array, default: () => [] },
		name: { type: String, default: '' },
		parameter: { type: String, default: '' },
		multiple: { type: Boolean, default: false },
		customclass: { type: String, default: 'btn-ghost-danger' },
		disabled: { type: Boolean, default: false },
		// Remove assets from group
		removefromgroup: { type: Boolean, default: false },
		assetgroupid: { type: [String, Number], default: null },
		assets: { type: Array, default: () => [] }
	},
	data() {
		return {
			row: {
				id: null
			},
			rows: {
				ids: []
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
				this.$emit('reloadDashboard')
			}, 500)
		}
	},
	methods: {
		refreshIds() {
			this.rows.ids = this.ids
			this.row.id = this.id
			this.deleteact = true
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingdelete = true

			if (this.removefromgroup) {
				this.groupProcess()
			} else if (!this.multiple) {
				axios.delete(this.$config.BACKEND_API_ROUTE+this.parameter+"/"+this.id+"/", { headers: this.header })
					.then(() => {
						this.deleteerrormsg = null
						this.deleteerror = false
						this.deletewithsuccess = true
					})
					.catch(e => {
						this.deleteerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.deleteerror = true
						this.deletewithsuccess = false
					})
					.finally(() => this.loadingdelete = false)
			} else {
				axios.post(this.$config.BACKEND_API_ROUTE+this.parameter+"/?delete=true", this.rows,
					{ headers: this.header })
					.then(() => {
						this.deleteerrormsg = null
						this.deleteerror = false
						this.deletewithsuccess = true
					})
					.catch(e => {
						this.deleteerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.deleteerror = true
						this.deletewithsuccess = false
					})
					.finally(() => this.loadingdelete = false)
			}
		},
		groupProcess() {
			var assetList = []

			for (const asset of this.assets) {
				if (!this.ids.includes(asset.id) && asset.id != this.id) {
					assetList.push(asset.id)
				}
			}

			var json = {
				assets: assetList
			}

			axios.patch(this.$config.BACKEND_API_ROUTE+"asset/groups/"+this.assetgroupid+"/", json,
				{ headers: this.header })
				.then(() => {
					this.deleteerrormsg = null
					this.deleteerror = false
					this.deletewithsuccess = true
				})
				.catch(e => {
					this.deleteerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.deleteerror = true
					this.deletewithsuccess = false
				})
				.finally(() => this.loadingdelete = false)
		}
	}
}
</script>