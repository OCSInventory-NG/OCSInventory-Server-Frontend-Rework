<template>
	<div id="edit-field-modal">
		<button 
			v-b-modal="'edit-field.'+idmodal"
			:title="$t('editfield')"
			class="btn btn-ghost-dark"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="'edit-field.'+idmodal"
			:title="$t('editfield')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('edituser') }}
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
							:label="$t('retrival_value')" 
							label-for="retrival_value"
						>
							<b-form-input
								id="retrival_value"
								v-model="row.retrival_value"
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
	name: 'EditFieldModal',
	props: {
		namefield: { type: String, default: null },
		retrivalvalue: { type: String, default: null },
		idmodal: { type: Number, required: true },
		section: { type: Number, required: true },
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_value: null,
				section: null
			},
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		this.row.name = this.namefield
		this.row.retrival_value = this.retrivalvalue
		this.row.id = this.idmodal
		this.row.section = this.section
	},
	methods: {
		// Submit edit section creation and call refresh edit template to reload
		onSubmit(event) {
			event.preventDefault()
			
			Axios.put(process.env.VUE_APP_API_ROUTE+"fields/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-field.'+this.row.id)
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-field.'+this.row.id)
				})
		},
	}
}
</script>
