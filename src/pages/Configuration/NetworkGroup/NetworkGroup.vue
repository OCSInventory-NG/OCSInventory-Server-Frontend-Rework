<template>
	<div 
		id="network-group"
		class="container-xl"
	>
		<div>
			<AddNetworkGroupModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canview="canview"
				page-title="netgroup"
			/>
		</div>
	</div>
</template>

<script>
import AddNetworkGroupModal from '@/components/Modals/AddItem/AddNetworkGroupModal.vue'

export default {
	name: "NetworkGroup",
	components: { AddNetworkGroupModal },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_netgroup")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_netgroup")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_netgroup")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_netgroup")) {
				this.candelete = true
			}
		}
	}
}
</script>