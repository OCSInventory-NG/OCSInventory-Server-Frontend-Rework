<template>
	<div 
		id="edit-template"
		class="container-xl"
	>
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
				<AddSectionModal
					:template="rowtemplatedata.id"
					@reloadTemplate="reloadTemplate"
				/>

				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<b-row class="text-center">
								<h2>{{ rowtemplatedata.name }}</h2>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>{{ $t('inventory.os') }} : {{ $t(rowtemplatedata.os) }}</p>
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
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import SectionCollapse from '@/components/Collapse/Template/SectionCollapse'
import AddSectionModal from '@/components/Modals/AddItem/AddSectionModal'
import Alert from '@/components/Alert/Alert'

export default {
	name: 'EditTemplate',
	components: {
		Loader, AddSectionModal, Alert, SectionCollapse	},
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
			errored: false
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
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			Axios.get(process.env.VUE_APP_API_ROUTE+"templates/"+this.id, { headers: header })
				.then(response => {
					this.rowtemplatedata = response.data
					this.rowsectiondata = response.data.sections
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadTemplate() {
			this.loading = true
			this.getTemplate()
		}
	}
}
</script>
