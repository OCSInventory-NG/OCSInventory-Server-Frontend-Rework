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
			>
				<div
					v-if="canadd"
				>
					<AddTemplateModal
						:canadd="canadd"
						:canedit="canedit"
						:candelete="candelete"
					/>
				</div>

				
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import AddTemplateModal from '@/components/Modals/AddItem/AddTemplateModal'

const header = {
	"Content-Type": "application/json;charset=utf-8",
	"Authorization": 'Token ' + localStorage.getItem('token_authentication')
}

export default {
	name: 'TemplatePage',
	components: {
		Loader,
		AddTemplateModal
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
		if(localStorage.getItem('permissions').split(",").includes("40")) {
			this.getTemplates()					
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		getTemplates() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"templates/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
					if(localStorage.getItem('permissions').split(",").includes("37")) {
						this.canadd = true
					}
					if(localStorage.getItem('permissions').split(",").includes("38")) {
						this.canedit = true
					}
					if(localStorage.getItem('permissions').split(",").includes("39")) {
						this.candelete = true
					}	
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadDatatable() {
			this.getTemplates()
		}
	}
}
</script>
