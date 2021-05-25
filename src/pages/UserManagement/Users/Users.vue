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
				<AddUserModal />

				<Datatable
					id="usersdatatable"
					:rowdata="rowdata"
					title="users"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Datatable from '@/components/Datatable/Datatable';
import Loader from '@/components/Loader/Loader';
import AddUserModal from '@/components/Modals/AddUserModal';

export default {
	name: "Users",
	components: {
		Datatable,
		Loader,
		AddUserModal
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

		Axios.get("http://172.18.26.12:8000/users/", { headers: header })
			.then(response => {
				this.rowdata = response.data
				this.errorMsg = null
				this.errored = false
			})
			.catch(e => {
				this.errorMsg = e
				this.errored = true
			})
			.finally(() => this.loading = false)
	}
}
</script>