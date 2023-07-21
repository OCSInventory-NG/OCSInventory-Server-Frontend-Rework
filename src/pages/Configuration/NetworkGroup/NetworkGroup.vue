<template>
	<div 
		id="network-group"
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Add network group modal -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<AddNetworkGroupModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
					page-title="netgroup"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Loader from '@/components/Loader/Loader'
import i18n from '../../../i18n'
import Alert from '@/components/Alert/Alert'
import AddNetworkGroupModal from '@/components/Modals/AddItem/AddNetworkGroupModal'

export default {
	name: "NetworkGroup",
	components: { Loader, Alert, AddNetworkGroupModal },
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			canadd: false,
			canedit: false,
			candelete: false
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_netgroup")) {
			if(localStorage.getItem('permissions').split(",").includes("add_netgroup")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_netgroup")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_netgroup")) {
				this.candelete = true
			}
			this.loading = false
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	}
}
</script>