<template>
	<div id="Ipdiscover">
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
				<Loader />
			</div>

			<div
				v-else
			>
				<Datatable
					id="ipdiscoverdatatable"
					:rowdata="rowdata"
					title="ipdiscover"
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
	name: "Ipdiscover",
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
		if(localStorage.getItem('permissions').split(",").includes("view_network")) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"networks/", { headers: header })
				.then(response => {
					response.data.forEach(element => {
						var array = {
							id: element.id,
							name: element.name,
							description: element.description,
							netid: element.netid,
							mask: element.mask,
							netdevices: element.netdevices.length,
							group: element.group
						}
						this.rowdata.push(array)
					});
                    
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
	}
}
</script>