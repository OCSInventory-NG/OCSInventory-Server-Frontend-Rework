<template>
	<div id="MyAccount">
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
				v-for="row in rowdata" 
				v-else
				:key="row.id"
			>
				<b-form
					@submit="onSubmit" 
					@reset="onReset"
				>
					<b-form-row>
						<b-form-group 
							id="input-group-2" 
							label="Username :" 
							label-for="input-2"
						>
							<b-form-input
								id="input-2"
								v-model="row.username"
								placeholder="Username"
								required
							>{{ row.username }}</b-form-input>
						</b-form-group>
						<b-form-group 
							id="input-group-2" 
							label="Email :" 
							label-for="input-2"
						>
							<b-form-input
								id="input-2"
								v-model="row.email"
								placeholder="Email"
								required
							>{{ row.email }}</b-form-input>
						</b-form-group>
					</b-form-row>
				</b-form>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader';

export default {
	name: "MyAccount",
	components: {
		Loader
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

		Axios.get("http://172.18.26.12:8000/myaccount/", { headers: header })
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
	},
	methods: {
		onSubmit(event) {
			event.preventDefault()
			alert(JSON.stringify(this.rowdata))
		},
		onReset(event) {
			event.preventDefault()
			// Reset our form values
			this.rowdata.username = ''
			this.rowdata.email = ''
		}
	}
}
</script>