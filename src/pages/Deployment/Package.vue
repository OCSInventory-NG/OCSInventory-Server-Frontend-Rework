<template>
	<div 
		id="packages" 
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Add package modal -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<AddPackageModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
					page-title="packages"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import AddPackageModal from '@/components/Modals/AddItem/AddPackageModal'

export default {
	name: 'Packages',
	components: { Loader, Alert, AddPackageModal },
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
		if(localStorage.getItem('permissions').split(",").includes("view_package")) {
			if(localStorage.getItem('permissions').split(",").includes("add_package")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_package")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_package")) {
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