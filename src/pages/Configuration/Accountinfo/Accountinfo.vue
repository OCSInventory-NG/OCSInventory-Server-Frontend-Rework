<template>
	<div id="Accountinfo">
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
				<Datatable
					id="accountinfodatatable"
					:rowdata="rowdata"
					:usecheckbox="false"
					title="accountinfo"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: "Accountinfo",
	components: {
		Loader,
		Datatable
	},
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			loading: true,
			errored: false,
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}
		if(localStorage.getItem('permissions').split(",").includes("view_accountinfoconfig")) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"accountinfo/config/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.accountinfovaluesTreatment()
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		accountinfovaluesTreatment() {
			this.rowdata.forEach(rowDetails => {
				var tmpValues = []
				rowDetails.accountinfo_values.forEach(valuesDetails => {
					tmpValues.push(valuesDetails.value)
				})
				rowDetails.accountinfo_values = tmpValues.join('\n')
			})
		},
	}
}
</script>