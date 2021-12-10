<template>
	<div id="Users">
		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			>
				<AddUserModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader';
import AddUserModal from '@/components/Modals/AddItem/AddUserModal';

export default {
	name: "Users",
	components: {
		Loader,
		AddUserModal
	},
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
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	}
}
</script>