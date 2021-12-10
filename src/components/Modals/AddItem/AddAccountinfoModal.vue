<template>
	<div id="AddAccountinfoModal">
		<section v-if="successed">
			<b-alert 
				:show="!!succesMsg" 
				class="alert-sm" 
				variant="success"
			>
				{{ $t('success_saved') }}
			</b-alert>
		</section>

		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			>
				<div
					v-if="canadd"
				>
					<b-button 
						v-b-modal.add-accountinfo
						:title="$t('addaccountinfo')"
						variant="success"
						class="add-button"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"/>
					</b-button>

					<b-modal 
						id="add-accountinfo" 
						:title="$t('addaccountinfo')"
						hide-footer
						modal-class="custom-modal"
					>
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
										:label="$t('description')" 
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
										:label="$t('datatype')" 
										label-for="datatype"
									>
										<b-form-select
											id="datatype"
											v-model="row.datatype" 
											:options="datatypeoptions" 
											class="mb-3"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('datatarget')" 
										label-for="datatarget"
									>
										<b-form-select
											id="datatarget"
											v-model="row.datatarget" 
											:options="datatargetoptions" 
											class="mb-3"
										/>
									</b-form-group>
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
										{{ $t('add') }}
									</b-button>
								</b-col>
								<b-col align-self="end"/>
							</b-row>
						</b-form>
					</b-modal>
				</div>
				
				<Datatable
					id="accountinfodatatable"
					:rowdata="rowdata"
					:canedit="canedit"
					:candelete="candelete"
					editcomponent="EditAccountinfoModal"
					title="accountinfo/config"
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: 'AddAccountinfoModal',
	components: {
		Datatable,
		Loader
	},
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				datatype: 'TEXT',
				datatarget: 'ASSET'
			},
			rowdata: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			datatargetoptions: [
				{ value: 'ASSET', text: i18n.t("assets") },
				{ value: 'IPDISCOVER', text: i18n.t("ipdiscover") },
				{ value: 'SNMP', text: i18n.t("snmp") }
			],
			datatypeoptions: [
				{ value: 'TEXT', text: 'TEXT' },
				{ value: 'TEXTAREA', text: 'TEXTAREA' },
				{ value: 'SELECT', text: 'SELECT' },
				{ value: 'CHECKBOX', text: 'CHECKBOX' },
			]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getAccountinfoConfig()
	},
	methods: {
		getAccountinfoConfig() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			Axios.get(process.env.VUE_APP_API_ROUTE+"accountinfo/config/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.accountinfovaluesTreatment()
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		accountinfovaluesTreatment() {
			this.rowdata.forEach(rowDetails => {
				var tmpValues = []
				rowDetails.accountinfo_values.forEach(valuesDetails => {
					tmpValues.push(valuesDetails.value)
				})
				rowDetails.accountinfo_values = tmpValues.join('\n')
			})
		},
		reloadDatatable() {
			this.getAccountinfoConfig()
		},
		// Submit template creation and call getAccountinfoConfig to reload datatable datas
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"accountinfo/config/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-accountinfo')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-accountinfo')
				})
				.finally(() => this.getAccountinfoConfig())
		}
	}
}
</script>
