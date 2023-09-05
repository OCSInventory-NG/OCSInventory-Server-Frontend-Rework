<template>
	<div 
		id="edit-package"
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
				<AddActionListModal
					:package="rowpackagedata.id"
					@reloadPackage="reloadPackage"
				/>

				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<b-row class="text-center">
								<h2>{{ rowpackagedata.name }}</h2>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>{{ $t('deployment.description') }} : {{ rowpackagedata.description }}</p>
									<p>{{ $t('deployment.target_os') }} : {{ $t('template.'+rowpackagedata.target_os) }}</p>
									<p>{{ $t('deployment.date_created') }} : {{ rowpackagedata.date_created }}</p>
								</b-col>
							</b-row>
							<ActionListCollapse
								:rowactiondata="rowactiondata"
								@reloadPackage="reloadPackage"
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
import Alert from '@/components/Alert/Alert'
import AddActionListModal from '@/components/Modals/AddItem/AddActionListModal'
import ActionListCollapse from '@/components/Collapse/Deployment/ActionListCollapse'

export default {
	name: 'EditPackage',
	components: { Loader, Alert, AddActionListModal, ActionListCollapse	},
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errorMsg: null,
			rowpackagedata: [],
			rowactiondata: [],
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
		this.getPackage()
	},
	methods: {
		getPackage() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"deployment/packages/"+this.id, { headers: this.header })
				.then(response => {
					this.rowpackagedata = response.data
					this.rowactiondata = response.data.actions_list
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadPackage() {
			this.loading = true
			this.getPackage()
		}
	}
}
</script>
