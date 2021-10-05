<template>
	<div id="TemplatePage">
		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			/>
		</section>
	</div>
</template>

<script>
// eslint-disable-next-line
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import i18n from '../../../i18n'

export default {
	name: 'TemplatePage',
	components: {
		Loader
	},
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			loading: true,
			errored: false,
			canadd: false,
			canedit: false,
			candelete: false
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_template")) {
			if(localStorage.getItem('permissions').split(",").includes("add_template")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_template")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_template")) {
				this.candelete = true
			}			
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	}
}
</script>
