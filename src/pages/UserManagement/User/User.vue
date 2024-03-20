<template>
	<div 
		id="user" 
		class="container-xl"
	>
		<div>
			<AddUserModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canview="canview"
				page-title="users"
			/>
		</div>
	</div>
</template>

<script>
import AddUserModal from '@/components/Modals/AddItem/AddUserModal.vue';

export default {
	name: "User",
	components: { AddUserModal },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_user")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_user")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_user")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_user")) {
				this.candelete = true
			}
		}
	}
}
</script>