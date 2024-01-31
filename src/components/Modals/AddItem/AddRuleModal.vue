<template lang="">
	<div id="add-rule-modal">
		<!-- Header page -->
		<div>
			<div class="page-header d-print-none text-white">
				<div class="row align-items-center">
					<div class="col">
						<div class="page-pretitle">
							<Breadcrumb />
						</div>
						<h2 class="page-title">
							{{ $t('title.'+pageTitle) }}
						</h2>
					</div>
					<div class="col-auto ms-auto">
						<!-- Button to add rule -->
						<b-button
							v-if="canadd"
							v-b-modal.add-rule
							:title="$t('rule.addrule')"
							variant="primary"
							class="d-none d-sm-inline-block"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('rule.addrule') }}
						</b-button>
					</div>
				</div>
			</div>
			<!-- Display datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display success box message -->
						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')" 
								variant="success"
							/>
						</section>

						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errorMsg" 
								variant="danger"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<div v-else>
							<Datatable
								id="rules-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								:canviewaction="canviewaction"
								editcomponent="EditRuleModal"
								title="automation/rule"
								translationkey="rule."
								@reloadDatatable="reloadDatatable"
							/>

							<!-- Modal to add rule -->
							<b-modal 
								v-if="canadd"
								id="add-rule" 
								:title="$t('rule.addrule')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('rule.addrule') }}
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
												:label="$t('rule.description')" 
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
												:label="$t('rule.trigger')" 
												label-for="trigger"
											>
												<b-form-select
													id="trigger"
													v-model="row.trigger" 
													:options="options" 
													class="mb-3 form-select"
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('rule.enabled')" 
												label-for="enabled"
											>
												<label class="form-check form-switch">
													<input 
														v-model="row.enabled"
														class="form-check-input"
														type="checkbox"
													>
												</label>
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
												{{ $t('generic.add') }}
											</b-button>
										</b-col>
										<b-col align-self="end" />
									</b-row>
								</b-form>
							</b-modal>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'

export default {
	name: "AddRuleModal",
	components: { Datatable, Loader, Alert, Breadcrumb },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canview: { type: Boolean, default: false },
		canviewaction: { type: Boolean, default: false },
		pageTitle: { type: String, default: "" }
	},
	data() {
		return {
			row: {
				description: null,
				trigger: 'inventory_received',
				enabled: false,
				logic: {}
			},
			rowdata: [],
			rowheader: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			options: [
				{ value: 'inventory_received', text: i18n.t('rule.inventory_received') },
				{ value: 'user_login', text: i18n.t('rule.user_login') },
				{ value: 'netdevice_received', text: i18n.t('rule.netdevice_received') }
			],
			excludefields: ["logic", "actions"]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	mounted() {
		this.options.sort((a,b) => (a.text > b.text) ?
			1 : ((b.text > a.text) ? -1 : 0))
		this.getHeader()
	},
	methods: {
		getHeader() {
			if(this.canview) {
				Axios.options(process.env.VUE_APP_API_ROUTE+"automation/rule/", { headers: this.header })
					.then(response => {
						Object.keys(response.data.actions.POST).forEach(field => {
							if(!this.excludefields.includes(field)) {
								this.rowheader.push(field)
							}
						})
						this.errorMsg = null
						this.errored = false
						this.getRules()
					})
					.catch(e => {
						this.errorMsg = e.message
						this.errored = true
					})
			} else {
				this.errorMsg = i18n.t("message.dont_have_right_to_see")
				this.errored = true
			}
		},
		getRules() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"automation/rule/", { headers: this.header })
				.then(response => {
					response.data.forEach(element => {
						element.trigger = i18n.t("rule." + element.trigger)
					})
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadDatatable() {
			this.getRules()
		},
		// Submit template creation and call getPackages to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"automation/rule/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-rule')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-rule')
				})
				.finally(() => this.getRules())
		}
	}
}
</script>