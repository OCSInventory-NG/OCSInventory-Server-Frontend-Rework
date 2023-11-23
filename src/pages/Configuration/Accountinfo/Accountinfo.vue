<template>
	<div 
		id="Accountinfo"
		class="container-xl"
	>
		<div>
			<AddAccountinfoModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canaddvalue="canaddvalue"
				:canview="canview"
				page-title="accountinfo"
			/>
		</div>
	</div>
</template>

<script>
import AddAccountinfoModal from '@/components/Modals/AddItem/AddAccountinfoModal'

export default {
	name: "Accountinfo",
	components: {
		AddAccountinfoModal
	},
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canaddvalue: false,
			canview: false
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_accountinfoconfig")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_accountinfoconfig")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_accountinfoconfig")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_accountinfoconfig")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("add_accountinfovalue")) {
				this.canaddvalue = true
			}		
		}
	},
}
</script>