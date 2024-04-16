<template>
	<div
		id="snmp"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="snmp"
			/>

			<!-- Display datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errorMsg" 
								variant="danger"
							/>
						</section>
						<section v-if="successed">
							<Alert 
								:message="succesMsg" 
								variant="success"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<div v-else>
							<div>
								<b-list-group flush>
									<b-list-group-item 
										class="d-flex justify-content-between align-items-center"
									>
										<div>
											<h4 class="mb-1">
												{{ $t("title.snmp") }}
											</h4>
											<p class="mb-1">
												{{ $t("network.enablesnmp") }}
											</p>
										</div>
										<div>
											<label class="form-check form-switch">
												<input 
													v-model="configs.value[0].value"
													class="form-check-input"
													type="checkbox"
													:disabled="!canedit"
													@change="enableSnmp()"
												>
											</label>
										</div>
									</b-list-group-item>
								</b-list-group>
							</div>
							<hr>
							<AddSnmpModalVue
								:canadd="canadd"
								:canedit="canedit"
								:candelete="candelete"
								:canview="canview"
								page-title="snmp"
							/>
							<hr>
							<AddSnmpTemplateModalVue
								:canadd="canadd"
								:canedit="canedit"
								:candelete="candelete"
								:canview="canview"
								page-title="snmp"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import AddSnmpModalVue from '@/components/Modals/AddItem/AddSnmpModal.vue'
import PageHeader from '@/components/Header/PageHeader.vue'
import AddSnmpTemplateModalVue from '@/components/Modals/AddItem/AddSnmpTemplateModal.vue'

export default {
	name: "Snmp",
	components: { AddSnmpModalVue, PageHeader, AddSnmpTemplateModalVue },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			configs: [],
			errorMsg: null,
			errored: false,
			succesMsg: null,
			successed: false,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.successed = false
				this.succesMsg = null
			}, 4000)
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_config")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_config")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_config")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_config")) {
				this.candelete = true
			}
			this.getSnmpConfig()
		}
	},
	methods: {
		getSnmpConfig() {
			this.configs = []
			this.loading = true
			
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"config/snmp", { headers: this.header })
				.then(response => {
					this.configs = response.data
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		enableSnmp() {
			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"config/snmp/", this.configs,
				{ headers: this.header })
				.then(() => {
					this.succesMsg = this.$t("message.success_saved")
					this.successed = true
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
		},
	}
}
</script>