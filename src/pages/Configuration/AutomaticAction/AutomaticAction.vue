<template>
	<div 
		id="automatique-action"
		class="container-xl"
	>
		<div>
			<AddAutomaticActionModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canview="canview"
				page-title="automaticactions"
			/>
		</div>
	</div>
</template>

<script>
import AddAutomaticActionModal from '@/components/Modals/AddItem/AddAutomaticActionModal'

export default {
	name: "AutomaticAction",
	components: { AddAutomaticActionModal },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_scheduler")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_scheduler")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_scheduler")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_scheduler")) {
				this.candelete = true
			}			
		}
	},
}
</script>