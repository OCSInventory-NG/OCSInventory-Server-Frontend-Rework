<template>
	<div 
		id="edit-package"
		class="container-xl"
	>
		<div>
			<AddActionListModal
				:package="id"
				:canaddaction="canaddaction"
				@reloadPackage="reloadPackage"
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
								<h2>{{ rowpackagedata.name }}</h2>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>{{ $t('deployment.description') }} : {{ rowpackagedata.description }}</p>
									<p>{{ $t('deployment.target_os') }} : {{ $t('template.'+rowpackagedata.target_os) }}</p>
									<p>{{ $t('deployment.date_created') }} : {{ rowpackagedata.date_created }}</p>
								</b-col>
							</b-row><br>
							<b-row class="text-center">
								<h3>{{ $t('deployment.actions') }}</h3>
							</b-row>
							<Draggable 
								:rowdata="rowactiondata"
								:rowheader="rowheader"
								:canedit="caneditaction"
								:candelete="candeleteaction"
								@reloadDatatable="reloadDatatable"
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
import AddActionListModal from '@/components/Modals/AddItem/AddActionListModal.vue'
import Draggable from '@/components/Draggable/Draggable.vue'

export default {
	name: 'EditPackage',
	components: { AddActionListModal, Draggable	},
	props: {
		id: { type: String, required: true }
	},
	data() {
		return {
			errorMsg: null,
			rowpackagedata: [],
			rowactiondata: [],
			rowheader: [],
			succesMsg: null,
			successed: false,
			loading: true,
			errored: false,
			canaddaction: false,
			caneditaction: false,
			candeleteaction: false,
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
		this.getHeader()
		if(localStorage.getItem('permissions').split(",").includes("add_action")) {
			this.canaddaction = true
		}
		if(localStorage.getItem('permissions').split(",").includes("change_action")) {
			this.caneditaction = true
		}
		if(localStorage.getItem('permissions').split(",").includes("delete_action")) {
			this.candeleteaction = true
		}
	},
	methods: {
		getHeader() {
			Axios.options(import.meta.env.VITE_APP_API_ROUTE+"deployment/actions?package="+this.id, { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errorMsg = null
					this.errored = false
					this.getPackage()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		reloadDatatable() {
			this.loading = true
			this.getPackage()
		},
		getPackage() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/"+this.id, { headers: this.header })
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
