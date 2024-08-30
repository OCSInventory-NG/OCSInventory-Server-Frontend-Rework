<template>
	<div id="do-all-actions-item-modal">
		<button 
			:title="$t(translationkey+titlevalue)"
			class="btn btn-ghost-warning"
			@click="getData()"
		>
			<font-awesome-icon 
				:icon="['fas', 'gear']"
			/>
		</button>

		<b-modal 
			:id="idModal"
			v-model="doallaction"
			:title="$t(translationkey+titlevalue)"
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t(translationkey+titlevalue) }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="errored"
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
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="errored"
					:message="errormsg" 
					variant="danger"
				/>
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
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
import axios from 'axios'

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
			errormsg: null,
			errored: false,
			idModal: 'manage-item'+this.id,
			loading: true,
			loadingcreate: false,
			createwithsuccess: false,
			doallaction: false,
			text: null,
			datavalues: [{value: ""}],
			get: this.reconciliationname+"="+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.doallaction = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		// Submit dynamic datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

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
				axios.post(this.$config.BACKEND_API_ROUTE+this.route+"/", jsonAdd, { headers: this.header })
					.then(() => {
						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = e
						this.errored = true
					})
					.finally(() => this.loadingcreate = false)
			}

			if(!this.errored) {
				this.loadingcreate = false
				this.createwithsuccess = true
			}
		},
		onUpdate(input) {
			if(input.id) {
				axios.patch(this.$config.BACKEND_API_ROUTE+this.route+"/"+input.id+"/", input, 
					{ headers: this.header })
					.then(() => {
						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			}
		},
		getData() {
			this.loading = true
			this.doallaction = true
			
			axios.get(this.$config.BACKEND_API_ROUTE+this.route+"/?"+this.get, { headers: this.header })
				.then(response => {
					if(response.data.length > 0) {
						this.datavalues = []
					}
					response.data.forEach(details => {
						this.datavalues.push(details)
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		addField(value, fieldType) {
			fieldType.push({ value: "" })
		},
		removeField(index, fieldType) {
			if(typeof fieldType[index].id !== 'undefined') {
				axios.delete(this.$config.BACKEND_API_ROUTE+this.route+"/"+fieldType[index].id, { headers: this.header })
					.then(() => {
						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			}
			fieldType.splice(index, 1)
		},
	}
}
</script>