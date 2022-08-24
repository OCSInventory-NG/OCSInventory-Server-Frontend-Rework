<template>
	<div id="DoAllActionsItemModal">
		<b-button 
			v-b-modal="idModal"
			:title="$t(titlevalue)"
		>
			<b-icon 
				icon="gear-wide-connected" 
				aria-hidden="true"
			/>
		</b-button>

		<b-modal 
			:id="idModal" 
			:title="$t(titlevalue)"
			hide-footer
			modal-class="custom-modal"
		>
			<b-form
				@submit="onSubmit"
			>
				<div
					v-for="(input, index) in datavalues"
					:key="`valueInput-${index}`"
					class="modal-allactions"
				>
					<b-row>
						<b-col cols="8">
							<b-form-group>
								<b-form-input
									:id="'value'+index"
									v-model="input.value"
									required
								/>
							</b-form-group>
						</b-col>
						<b-col cols="4">
							<b-button 
								v-b-modal="idModal"
								:title="$t(titlevalue)"
								variant="success"
								@click="addField(input, datavalues)"
							>
								<b-icon 
									icon="plus" 
									aria-hidden="true"
								/>
							</b-button>
							&nbsp;
							<b-button 
								v-b-modal="idModal"
								v-show="datavalues.length > 1"
								:title="$t(titlevalue)"
								variant="danger"
								@click="removeField(index, datavalues)"
							>
								<b-icon 
									icon="x" 
									aria-hidden="true"
								/>
							</b-button>
						</b-col>
					</b-row>
				</div>
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
	name: 'DoAllActionsItemModal',
	props: {
		id: { type: Number, default: null },
		route: { type: String, default: '' },
		titlevalue: { type: String, default: '' },
		reconciliationname: { type: String, default: '' }
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
			idModal: 'manage-item'+this.id,
			text: null,
			datavalues: [{ value: "" }],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		// Submit dynamic datas
		onSubmit(event) {
			event.preventDefault()

			this.datavalues.forEach(data => {
				var jsonArray = {
					[this.reconciliationname]: this.id,
					value: data.value
				}

				Axios.post(process.env.VUE_APP_API_ROUTE+this.route+"/", jsonArray, { headers: this.header })
					.then(() => {
						this.succesMsg = "success"
						this.successed = true
						this.errorMsg = null
						this.errored = false
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
						this.succesMsg = null
						this.successed = false
					})
			})

			this.$bvModal.hide('manage-item'+this.row.id)
			this.$emit('reloadDatatable')
		},
		getData() {
			Axios.get(process.env.VUE_APP_API_ROUTE+this.route+"/", { headers: this.header })
		},
		onAdd(json) {
			Axios.post(process.env.VUE_APP_API_ROUTE+this.route+"/", json, { headers: this.header })
		},
		onDelete(json) {
			Axios.post(process.env.VUE_APP_API_ROUTE+this.route+"/"+json, { headers: this.header })
		},
		addField(value, fieldType) {
			fieldType.push({ value: "" });
		},
		removeField(index, fieldType) {
			fieldType.splice(index, 1);
		},
	}
}
</script>