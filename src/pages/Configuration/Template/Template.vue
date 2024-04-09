<template>
	<div
		id="template" 
		class="container-xl"
	>
		<div>
			<AddTemplateModal
				:canadd="canadd"
				:canedit="canedit"
				:candelete="candelete"
				:canview="canview"
				page-title="templates"
			/>
		</div>
	</div>
</template>

<script>
import AddTemplateModal from '@/components/Modals/AddItem/AddTemplateModal.vue'

export default {
	name: 'Template',
	components: { AddTemplateModal },
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			exportemplate: false,
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_template")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_template")) {
				this.canadd = true
				this.exportemplate = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_template")) {
				this.canedit = true
				this.exportemplate = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_template")) {
				this.candelete = true
				this.exportemplate = true
			}
			this.loading = false			
		}
	}
}
</script>