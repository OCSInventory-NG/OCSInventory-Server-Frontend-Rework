<template>
	<div 
		id="report" 
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Add report package modal -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				bonjour
			</div>
		</section>
	</div>
</template>

<script>
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'

export default {
	name: 'Report',
	components: { Loader, Alert },
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_result")) {
			this.loading = false
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	}
}
</script>