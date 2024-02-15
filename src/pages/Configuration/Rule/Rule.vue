<template lang="">
	<div 
		id="rules" 
		class="container-xl"
	>
		<div>
			<AddRuleModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canviewaction="canviewaction"
				:canview="canview"
				page-title="rules"
			/>
		</div>
	</div>
</template>
<script>
import AddRuleModal from '@/components/Modals/AddItem/AddRuleModal'

export default {
	name: "Rule",
	components: { AddRuleModal },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			canviewaction: false,
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_rule")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_rule")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_rule")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_rule")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("view_action")) {
				this.canviewaction = true
			}
		}
	}
}
</script>