<template>
	<div 
		id="edit-template"
		class="container-xl"
	>
		<div>
			<AddSectionModal
				:template="id"
				@reloadTemplate="reloadTemplate"
			/>

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
							<SectionCollapse
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
import Axios from 'axios'
import SectionCollapse from '@/components/Collapse/Template/SectionCollapse.vue'
import AddSectionModal from '@/components/Modals/AddItem/AddSectionModal.vue'

export default {
	name: 'EditTemplate',
	components: { AddSectionModal, SectionCollapse	},
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errorMsg: null,
			rowtemplatedata: [],
			rowsectiondata: [],
			succesMsg: null,
			successed: false,
			loading: true,
			errored: false,
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
		this.getTemplate()
	},
	methods: {
		getTemplate() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"templates/"+this.id, { headers: this.header })
				.then(response => {
					this.rowtemplatedata = response.data
					this.rowsectiondata = response.data.sections
					this.errorMsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
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
