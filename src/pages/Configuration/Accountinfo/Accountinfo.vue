<template>
	<div 
		id="Accountinfo"
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
				<AddAccountinfoModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
					:canaddvalue="canaddvalue"
					page-title="accountinfo"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import AddAccountinfoModal from '@/components/Modals/AddItem/AddAccountinfoModal'

export default {
	name: "Accountinfo",
	components: {
		Loader,
		Alert,
		AddAccountinfoModal
	},
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canaddvalue: false,
			errorMsg: null,
			loading: true,
			errored: false,
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_accountinfoconfig")) {
			if(localStorage.getItem('permissions').split(",").includes("add_accountinfoconfig")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_accountinfoconfig")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_accountinfoconfig")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("add_accountinfovalue")) {
				this.canaddvalue = true
			}
			this.loading = false			
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
}
</script>