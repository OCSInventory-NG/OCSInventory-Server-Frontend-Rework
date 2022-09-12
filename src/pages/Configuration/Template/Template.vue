<template>
	<div
		id="template" 
		class="container-xl"
	>
		<!-- Display error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Datatable -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<AddTemplateModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
					page-title="templates"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import i18n from '../../../i18n'
import Alert from '@/components/Alert/Alert'
import Loader from '@/components/Loader/Loader'
import AddTemplateModal from '@/components/Modals/AddItem/AddTemplateModal'

export default {
	name: 'Template',
	components: { Alert, Loader, AddTemplateModal },
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			canadd: false,
			canedit: false,
			candelete: false,
			exportemplate: false,
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_template")) {
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
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	}
}
</script>