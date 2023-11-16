<template>
	<div id="add-ldap-modal">
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

		<!-- Display info if no error -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<!-- Header page -->
			<div v-else>
				<div class="page-header d-print-none">
					<div class="row">
						<div class="col-auto">
							<h2>{{ $t("authentication.ldap_config") }}</h2>
						</div>
						<div class="col-auto ms-auto">
							<!-- Button to add ldap -->
							<b-button
								v-if="canadd"
								v-b-modal.add-ldap
								:title="$t('authentication.addldap')"
								variant="primary"
								class="d-none d-sm-inline-block"
							>
								<font-awesome-icon 
									:icon="['fas', 'plus']"
								/>
								{{ $t('authentication.addldap') }}
							</b-button>

							<!-- Modal to add template -->
							<b-modal 
								id="add-ldap" 
								:title="$t('authentication.addldap')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('authentication.addldap') }}
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
												:label="$t('authentication.SERVER_URI')" 
												label-for="SERVER_URI"
											>
												<b-form-input
													id="SERVER_URI"
													v-model="row.config.SERVER_URI"
													required
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('authentication.BIND_DN')" 
												label-for="BIND_DN"
											>
												<b-form-input
													id="BIND_DN"
													v-model="row.config.BIND_DN"
													required
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('authentication.BIND_PASSWORD')" 
												label-for="BIND_PASSWORD"
											>
												<b-form-input
													id="BIND_PASSWORD"
													v-model="row.config.BIND_PASSWORD"
													required
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('authentication.BASE_DN')" 
												label-for="BASE_DN"
											>
												<b-form-input
													id="BASE_DN"
													v-model="row.config.BASE_DN"
													required
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('authentication.USER_LOGIN_FIELD')" 
												label-for="USER_LOGIN_FIELD"
											>
												<b-form-input
													id="USER_LOGIN_FIELD"
													v-model="row.config.USER_LOGIN_FIELD"
													required
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('authentication.PROTOCOL_VERSION')" 
												label-for="PROTOCOL_VERSION"
											>
												<b-form-select
													id="PROTOCOL_VERSION"
													v-model="row.config.PROTOCOL_VERSION" 
													:options="options" 
													class="mb-3 form-select"
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-checkbox
												id="enabled"
												v-model="row.enabled"
												name="enabled"
												:value="true"
												unchecked
											>
												{{ $t('authentication.enabled') }}
											</b-form-checkbox>
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
				<!-- Display datatable -->
				<div class="page-body">
					<Draggable 
						v-if="!loading"
						:rowdata="rowdata"
						:rowheader="rowheader"
						:canedit="canedit"
						:candelete="candelete"
						editcomponent="EditLdapModal"
						translationkey="authentication"
						apiroute="auth_config"
						@reloadDatatable="reloadDatatable"
					/>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import Draggable from '@/components/Draggable/Draggable'
import Alert from '@/components/Alert/Alert'

export default {
	name: 'AddTemplateModal',
	components: { Draggable, Loader, Alert },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		pageTitle: { type: String, default: "" },
		authid: { type: Number, default: 2 }
	},
	data() {
		return {
			row: {
				auth_method: this.authid,
				enabled: true,
				priority: 1,
				config: {
					SERVER_URI: null,
					BIND_DN: null,
					BIND_PASSWORD: null,
					BASE_DN: null,
					USER_LOGIN_FIELD: null,
					MIRROR_GROUPS: false,
					PROTOCOL_VERSION: 3
				}
			},
			rowdata: [],
			rowheader: [
				"id",
				"priority",
				"enabled",
				"SERVER_URI",
				"BIND_DN",
				"BIND_PASSWORD",
				"BASE_DN",
				"USER_LOGIN_FIELD",
				"MIRROR_GROUPS",
				"PROTOCOL_VERSION"
			],
			options: [
				{ value: 2, text: "v2" },
				{ value: 3, text: "v3" }
			],
			loading: false,
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
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getLdapConfig()
	},
	methods: {
		reloadDatatable() {
			this.loading = true
			this.rowdata = []
			this.getLdapConfig()
		},
		getLdapConfig() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"auth_config?auth_method="+this.authid, { headers: this.header })
				.then(response => {
					var tmpLdap = response.data

					tmpLdap.forEach(element => {
						this.rowdata.push({
							id: element.id,
							priority: element.priority,
							enabled: element.enabled,
							SERVER_URI: element.config.SERVER_URI,
							BIND_DN: element.config.BIND_DN,
							BIND_PASSWORD: element.config.BIND_PASSWORD,
							BASE_DN: element.config.BASE_DN,
							USER_LOGIN_FIELD: element.config.USER_LOGIN_FIELD,
							MIRROR_GROUPS: element.config.MIRROR_GROUPS,
							PROTOCOL_VERSION: element.config.PROTOCOL_VERSION
						})
					});
					
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit ldap confg creation and call getLdapConfig to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"auth_config/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-ldap')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-ldap')
				})
				.finally(() => this.reloadDatatable())
		}
	}
}
</script>