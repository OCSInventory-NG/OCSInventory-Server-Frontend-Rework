<template>
	<div 
		id="user" 
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Add user modal -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<AddUserModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
					page-title="users"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import AddUserModal from '@/components/Modals/AddItem/AddUserModal';
import Loader from '@/components/Loader/Loader';
import i18n from '../../../i18n'
import Alert from '@/components/Alert/Alert.vue';

export default {
	name: "User",
	components: { AddUserModal, Loader, Alert },
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
		if(localStorage.getItem('permissions').split(",").includes("view_user")) {
			if(localStorage.getItem('permissions').split(",").includes("add_user")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_user")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_user")) {
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