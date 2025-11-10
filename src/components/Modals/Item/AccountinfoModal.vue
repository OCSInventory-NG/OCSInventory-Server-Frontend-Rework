<template>
	<div id="accountinfo-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('accountinfo.addaccountinfo')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="accountinfomodal = !accountinfomodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('accountinfo.addaccountinfo') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('accountinfo.editaccountinfo')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="accountinfomodal" 
			v-model="accountinfomodal"
			:title="(!update) ? $t('accountinfo.addaccountinfo') : $t('accountinfo.editaccountinfo')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('accountinfo.addaccountinfo') : $t('accountinfo.editaccountinfo') }}
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
						v-if="createerror"
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
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
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
							:label="$t('generic.description')" 
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
					<b-col>
						<b-form-group
							:label="$t('accountinfo.datatype')" 
							label-for="datatype"
						>
							<v-select
								id="datatype"
								v-model="row.datatype" 
								:options="datatypeoptions" 
								:reduce="text => text.value"
								:clearable="false"
								:disabled="(update) ? true : false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('accountinfo.datatarget')" 
							label-for="datatarget"
						>
							<v-select
								id="datatarget"
								v-model="row.datatarget" 
								:options="datatargetoptions" 
								:reduce="text => text.value"
								:clearable="false"
								:disabled="(update) ? true : false"
								label="text"
								class="mb-3"
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
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
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
	name: "AccountinfoModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				datatype: 'TEXT',
				datatarget: 'ASSET'
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			accountinfomodal: false,
			datatargetoptions: [
				{ value: 'ASSET', text: this.$t("title.assets") },
				{ value: 'IPDISCOVER', text: this.$t("title.ipdiscover") },
				{ value: 'SNMP', text: this.$t("title.snmp") }
			],
			datatypeoptions: [
				{ value: 'TEXT', text: 'TEXT' },
				{ value: 'TEXTAREA', text: 'TEXTAREA' },
				{ value: 'SELECT', text: 'SELECT' },
				{ value: 'CHECKBOX', text: 'CHECKBOX' },
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.accountinfomodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null,
					datatype: 'TEXT',
					datatarget: 'ASSET'
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.accountinfomodal = true
			this.getAccountinfo(id)
		},
		async getAccountinfo(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"accountinfo/config/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"accountinfo/config/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			} else {
				var update = {
					name: this.row.name,
					description: this.row.description
				}

				axios.patch(this.$config.BACKEND_API_ROUTE+"accountinfo/config/"+this.row.id+"/", update,
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			}			
		}
	}
}
</script>