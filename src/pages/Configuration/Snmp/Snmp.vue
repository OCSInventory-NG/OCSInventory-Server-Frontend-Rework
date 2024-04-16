<template>
	<div
		id="snmp" 
		class="container-xl"
	>
		<AddSnmpModalVue
			:canadd="canadd"
			:canedit="canedit"
			:candelete="candelete"
			:canview="canview"
			page-title="snmp"
		/>
	</div>
</template>

<script>
import AddSnmpModalVue from '@/components/Modals/AddItem/AddSnmpModal.vue'

export default {
	name: "Snmp",
	components: { AddSnmpModalVue },
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_config")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_config")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_config")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_config")) {
				this.candelete = true
			}
		}
	}
}
</script>