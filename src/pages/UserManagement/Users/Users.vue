<template>
	<div id="Users">
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
				<AddUserModal
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader';
import AddUserModal from '@/components/Modals/AddItem/AddUserModal';

export default {
	name: "Users",
	components: {
		Loader,
		AddUserModal
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
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

		if(localStorage.getItem('permissions').split(",").includes("16")) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"users/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
					if(localStorage.getItem('permissions').split(",").includes("13")) {
						this.canadd = true
					}
					if(localStorage.getItem('permissions').split(",").includes("14")) {
						this.canedit = true
					}
					if(localStorage.getItem('permissions').split(",").includes("15")) {
						this.candelete = true
					}
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		}
		
	}
}
</script>