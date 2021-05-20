<template>
	<div>
		<b-alert 
			:show="!!errorMsg" 
			class="alert-sm" 
			variant="danger"
		>
			{{ errorMsg }}
		</b-alert>

		<div v-if="errorMsg === null">
			<Datatable 
				:rowdata="rowdata" 
				title="Users" 
			/>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import Datatable from '@/components/Datatable/Datatable';

export default {
	name: "Users",
	components: {
		Datatable
	},
	data() {
		return {
			errorMsg: null,
			rowdata: []
		}
	},
	created() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

		Axios.get("http://172.18.26.12:8000/users/", { headers: header })
			.then(response => {
				console.log(response.data)
				this.rowdata = response.data
				this.errorMsg = null
			})
			.catch(e => {
				this.errorMsg = e
			})
	}
}
</script>