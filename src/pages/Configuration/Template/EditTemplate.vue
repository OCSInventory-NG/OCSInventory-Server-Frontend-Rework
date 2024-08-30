<template>
	<div 
		id="edit-template"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="edittemplate"
			/>

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg" 
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
							<b-row class="text-center">
								<h2>{{ rowtemplatedata.name }}</h2>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>{{ $t('inventory.os') }} : {{ $t("template." + rowtemplatedata.os) }}</p>
									<p>{{ $t('inventory.last_update') }} : {{ rowtemplatedata.last_update }}</p>
								</b-col>
							</b-row>
							<SectionModal
								:template="parseInt(id)"
								:routetype="routetype"
								@reloadTemplate="reloadTemplate"
							/>
							<SectionCollapse
								:routetype="routetype"
								:rowsectiondata="rowsectiondata"
								@reloadTemplate="reloadTemplate"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'EditTemplate',
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errormsg: null,
			rowtemplatedata: [],
			rowsectiondata: [],
			successmsg: null,
			successed: false,
			loading: true,
			errored: false,
			routetype: "assets",
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
	beforeMount() {
		if(this.$route.path.includes("snmp")) {
			this.routetype = "snmp"
		}
	},
	mounted() {
		this.getTemplate()
	},
	methods: {
		getTemplate() {
			axios.get(this.$config.BACKEND_API_ROUTE+"templates/"+this.id, { headers: this.header })
				.then(response => {
					this.rowtemplatedata = response.data
					this.rowsectiondata = response.data.sections
					this.errormsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		reloadTemplate() {
			this.loading = true
			this.getTemplate()
		}
	}
}
</script>
