<template>
	<div id="ResultDetail">		
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Accountinf form -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<Datatable
					id="assets-deployment-datatable"
					:rowdata="rowdata"
					:rowheader="rowheader"
					title="assets-deployment-result"
					translationkey="deployment."
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader';
import Alert from '@/components/Alert/Alert.vue';
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: 'ResultDetail',
	components: { Loader, Alert, Datatable },
	props: {
		type: { type: String, default: '' },
		id: { type: String, default: null }
	},
	data() {
		return {
			rowdata: [],
			rowheader: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		this.getHeader()
	},
	methods: {
		getHeader() {
			Axios.options(process.env.VUE_APP_API_ROUTE+"deployment/results", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errorMsg = null
					this.errored = false
					this.getResult()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getResult() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"deployment/results?asset="+this.id, { headers: this.header })
				.then(response => {
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		}
	}
}
</script>