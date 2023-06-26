<template>
	<div 
		id="detail" 
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
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
										{{ $t(key) }}
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
										title="Administrative data"
										active
									>
										<p>I'm the first tab</p>
									</b-tab>
									<b-tab title="Inventory sections">
										<p>I'm the second tab</p>
									</b-tab>
								</b-tabs>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
//import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
//import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader' 

export default {
	name: 'Detail',
	components: { Loader, Alert, PageHeader },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			loading: true,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		var extendedRoute = null
		if(this.$route.params.type == 'assets') extendedRoute = "asset/bases/"+this.$route.params.id
		if(this.$route.params.type == 'netdevice') extendedRoute = "netdevices/"+this.$route.params.id

		Axios.get(process.env.VUE_APP_API_ROUTE+extendedRoute, { headers: this.header })
			.then(response => {
				this.rowdata = response.data
				this.errorMsg = null
				this.errored = false
			})
			.catch(e => {
				this.errorMsg = e.message
				this.errored = true
			})
			.finally(() => this.loading = false)
	}
}
</script>