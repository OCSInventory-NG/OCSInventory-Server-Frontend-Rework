<template>
	<div 
		id="groups"
		class="container-xl"
	>
		<div>
			<AddGroupModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canview="canview"
				page-title="groups"
			/>
		</div>
	</div>
</template>

<script>
import AddGroupModal from '@/components/Modals/AddItem/AddGroupModal';

export default {
	name: "Group",
	components: { AddGroupModal },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_group")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_group")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_group")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_group")) {
				this.candelete = true
			}
		}
	}
}
</script>