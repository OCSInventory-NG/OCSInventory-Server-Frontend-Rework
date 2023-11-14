<template>
	<div 
		id="automatique-action"
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
				<AddAutomaticActionModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
					page-title="automaticactions"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import AddAutomaticActionModal from '@/components/Modals/AddItem/AddAutomaticActionModal'

export default {
	name: "AutomaticAction",
	components: {
		Loader,
		Alert,
		AddAutomaticActionModal
	},
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			errorMsg: null,
			loading: true,
			errored: false,
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_scheduler")) {
			if(localStorage.getItem('permissions').split(",").includes("add_scheduler")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_scheduler")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_scheduler")) {
				this.candelete = true
			}
			this.loading = false			
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
}
</script>