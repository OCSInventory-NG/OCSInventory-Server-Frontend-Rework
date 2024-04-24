<template>
	<div 
		id="report" 
		class="container-xl"
	>
		<!-- Header page -->
		<div>
			<PageHeader 
				page-title="report"
			/>
			<!-- Display datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
							Work in progress
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
//import axios from 'axios'
import PageHeader from '@/components/Header/PageHeader.vue'

export default {
	name: 'Report',
	components: { PageHeader },
	data() {
		return {
			canview: false,
			canadd: false,
			candelete: false,
			canedit: false,
			loading: true,
			errored: false,
			errormsg: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_result")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_result")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_result")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_result")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	}
}
</script>