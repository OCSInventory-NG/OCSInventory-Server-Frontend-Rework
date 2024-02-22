<template>
	<div id="do-all-actions-item-modal">
		<button 
			v-b-modal="idModal"
			:title="$t(translationkey+titlevalue)"
			class="btn btn-ghost-warning"
		>
			<font-awesome-icon 
				:icon="['fas', 'gear']"
			/>
		</button>

		<b-modal 
			:id="idModal"
			:title="$t(translationkey+titlevalue)"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t(translationkey+titlevalue) }}
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
									@change="onUpdate(input)"
								/>
							</b-form-group>
						</b-col>
						<b-col cols="2">
							<b-form-group>
								<b-button 
									v-b-modal="idModal"
									:title="$t(translationkey+titlevalue)"
									variant="primary"
									class="d-none d-sm-inline-block form-control"
									@click="addField(input, datavalues)"
								>
									<font-awesome-icon 
										:icon="['fas', 'plus']"
									/>
								</b-button>
							</b-form-group>
						</b-col>
						<b-col 
							v-show="datavalues.length > 1"
							cols="2"
						>
							<b-form-group>
								<b-button 
									v-b-modal="idModal"
									:title="$t(translationkey+titlevalue)"
									variant="danger"
									class="d-none d-sm-inline-block form-control"
									@click="removeField(index, datavalues)"
								>
									<font-awesome-icon 
										:icon="['fas', 'trash-can']"
									/>
								</b-button>
							</b-form-group>
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
							{{ $t('generic.save') }}
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
		reconciliationname: { type: String, default: '' },
		translationkey: { type: String, default: '' }
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
			datavalues: [{value: ""}],
			get: this.reconciliationname+"="+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		this.getData()	
	},
	methods: {
		// Submit dynamic datas
		onSubmit(event) {
			event.preventDefault()

			var jsonAdd = []

			this.datavalues.forEach(data => {
				if(!data.id) {
					jsonAdd.push({
						[this.reconciliationname]: this.id,
						value: data.value
					})
				}
			})

			if(jsonAdd.length > 0) {
				Axios.post(process.env.VUE_APP_API_ROUTE+this.route+"/", jsonAdd, { headers: this.header })
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
					.finally(() => this.$emit("reloadDatatable"))
			} else {
				this.$emit("reloadDatatable")
			}

			this.$bvModal.hide('manage-item'+this.row.id)
		},
		onUpdate(input) {
			if(input.id) {
				Axios.patch(process.env.VUE_APP_API_ROUTE+this.route+"/"+input.id+"/", input, 
					{ headers: this.header })
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
			}
		},
		getData() {
			Axios.get(process.env.VUE_APP_API_ROUTE+this.route+"/?"+this.get, { headers: this.header })
				.then(response => {
					if(response.data.length > 0) {
						this.datavalues = []
					}
					response.data.forEach(details => {
						this.datavalues.push(details)
					})
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		addField(value, fieldType) {
			fieldType.push({ value: "" })
		},
		removeField(index, fieldType) {
			if(typeof fieldType[index].id !== 'undefined') {
				Axios.delete(process.env.VUE_APP_API_ROUTE+this.route+"/"+fieldType[index].id, { headers: this.header })
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
			}
			fieldType.splice(index, 1)
		},
	}
}
</script>