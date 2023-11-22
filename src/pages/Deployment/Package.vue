<template>
	<div 
		id="packages" 
		class="container-xl"
	>
		<div>
			<AddPackageModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canviewaction="canviewaction"
				:canview="canview"
				page-title="packages"
			/>
		</div>
	</div>
</template>

<script>
import AddPackageModal from '@/components/Modals/AddItem/AddPackageModal'

export default {
	name: 'Packages',
	components: { AddPackageModal },
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
		if(localStorage.getItem('permissions').split(",").includes("view_package")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_package")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_package")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_package")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("view_action")) {
				this.canviewaction = true
			}
		}
	}
}
</script>