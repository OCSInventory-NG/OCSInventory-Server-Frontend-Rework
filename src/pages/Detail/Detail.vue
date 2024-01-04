<template>
	<div 
		id="detail" 
		class="container-xl"
	>
		<div>
			<!-- Page header for asset -->
			<PageHeader 
				v-if="rowdata.name"
				:page-title="rowdata.name"
			/>

			<!-- Page header for netdevice -->
			<PageHeader 
				v-if="rowdata.netname"
				:page-title="rowdata.netname"
			/>

			<!-- Display details -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
							<div class="hr-text">
								Informations
							</div>
							<div class="datagrid">
								<div 
									v-for="(value,key) in rowdata"
									:key="key"
									class="datagrid-item"
								>
									<div class="datagrid-title">
										{{ $t(translationkey+key) }}
									</div>
									<div class="datagrid-content">
										{{ value }}
									</div>
								</div>
							</div>
							<br><br>
							<div>
								<b-tabs
									content-class="mt-3"
									fill
								>
									<b-tab
										:title="$t('title.accountinfo')"
										active
									>
										<fieldset class="form-fieldset">
											<Accountinfo
												:id="rowdata.id"
												:type="type"
												:canedit="canedit"
												:slug="slug"
											/>
										</fieldset>
									</b-tab>
									<b-tab :title="$t('title.inventory')">
										<p>I'm the second tab</p>
									</b-tab>
									<b-tab 
										v-if="type == 'ASSET'"
										:title="$t('title.deployment')"
									>
										<ResultDetail
											:id="$route.params.id"
										/>
									</b-tab>
								</b-tabs>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import Accountinfo from '@/components/Accountinfo/Accountinfo'
import ResultDetail from '@/components/Deployment/ResultDetail'

export default {
	name: 'Detail',
	components: { Loader, Alert, PageHeader, Accountinfo, ResultDetail },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			loading: true,
			errored: false,
			canedit: true,
			type: null,
			slug: null,
			translationkey: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		var extendedRoute = null
		if(this.$route.params.type == 'assets') {
			extendedRoute = "asset/bases/"+this.$route.params.id
			this.type = "ASSET"
			this.slug = "inventory_base.inventorybase"
			this.translationkey = "inventory."
		}
		if(this.$route.params.type == 'netdevice') {
			extendedRoute = "netdevices/"+this.$route.params.id
			this.type = "IPDISCOVER"
			this.slug = "netdevice.netdevice"
			this.translationkey = "network."
		}

		Axios.get(process.env.VUE_APP_API_ROUTE+extendedRoute, { headers: this.header })
			.then(response => {
				this.rowdata = response.data
				this.errorMsg = null
				this.errored = false
				this.loading = false
			})
			.catch(e => {
				this.errorMsg = e.message
				this.errored = true
			})
	}
}
</script>