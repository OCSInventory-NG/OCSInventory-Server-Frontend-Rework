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
			deleteerror: false,
			deleteerrormsg: null,

			deletewithsuccess: false,

			row: {
				id: null
			},
			rows: {
				ids: []
			},
			deleteact: false,
			idModal: 'delete-item'+this.id,
			text: null,
			
			loadingdelete: false,
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
			this.deleteerror = false
			this.deleteerrormsg = null
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingdelete = true

			try {
				if (this.removefromgroup) {
					await this.groupProcess()
				} else if (!this.multiple) {
					// DELETE /<parameter>/<id>/
					await this.$api.generic.delete(`${this.parameter}/${this.id}/`)

					this.deleteerrormsg = null
					this.deleteerror = false
					this.deletewithsuccess = true
				} else {
					// POST /<parameter>/?delete=true (bulk delete)
					await this.$api.generic.post(
						`${this.parameter}/`,
						this.rows,
						{ delete: true } // customParams
					)

					this.deleteerrormsg = null
					this.deleteerror = false
					this.deletewithsuccess = true
				}
			} catch (e) {
				this.deleteerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.deleteerror = true
				this.deletewithsuccess = false
			} finally {
				this.loadingdelete = false
			}
		},

		async groupProcess() {
			const assetList = (this.assets || [])
				.filter(a => a && a.id != null)
				.filter(a => !this.ids.includes(a.id) && a.id !== this.id)
				.map(a => a.id)

			const payload = { assets: assetList }

			try {
				await this.$api.generic.patch(
					`asset/groups/${this.assetgroupid}/`,
					payload
				)

				this.deleteerrormsg = null
				this.deleteerror = false
				this.deletewithsuccess = true
			} catch (e) {
				this.deleteerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.deleteerror = true
				this.deletewithsuccess = false
				throw e
			}
		},
	}
}
</script>