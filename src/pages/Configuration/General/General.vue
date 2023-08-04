<template>
	<div
		id="general" 
		class="container-xl"
	>
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

		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<!-- Page header -->
				<PageHeader 
					page-title="config"
				/>

				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<Datatable
								id="generalDatatable"
								:rowdata="rowdata"
								:candelete="false"
								:canedit="false"
								:usecheckbox="false"
								:canexport="false"
								:caneditconfig="caneditconfig"
								editcomponent="EditConfigModal"
								title="config"
								translationkey="configuration."
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'

export default {
	name: 'General',
	components: { Datatable, Alert, Loader, PageHeader },
	data() {
		return {
			rowdata: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			loading: true,
			caneditconfig: false,
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
		if(localStorage.getItem('permissions').split(",").includes("view_config")) {
			if(localStorage.getItem('permissions').split(",").includes("change_config")) {
				this.caneditconfig = true
			}
			this.getConfig()
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}	
	},
	methods: {
		// Get all config
		getConfig() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"config", { headers: this.header })
				.then(response => {
					response.data.forEach(element => {
						var tmpArray = [];
						tmpArray = {
							name: element.name,
							description: i18n.t('configuration.'+element.name),
							value: element.value
						}
						this.rowdata.push(tmpArray)
					});
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.loading = false
				})
		},
		updateConfig() {
			var config = []
			this.rowdata.forEach(element => {
				config.push({
					name: element.name,
					value: element.value
				})
			})
			Axios.put(process.env.VUE_APP_API_ROUTE+"config/", config, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
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
		reloadDatatable() {
			this.updateConfig()
		}
	}
}
</script>