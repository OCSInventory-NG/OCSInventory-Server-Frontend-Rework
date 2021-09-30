<template>
	<div id="Groups">
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
				<AddGroupModal 
					:canadd="canadd"
					:canedit="canedit"
					:candelete="candelete" />
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader';
import AddGroupModal from '@/components/Modals/AddItem/AddGroupModal';

export default {
	name: "Groups",
	components: {
		Loader,
		AddGroupModal
	},
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			canadd: true,
			canedit: true,
			candelete: true
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

		Axios.get(process.env.VUE_APP_API_ROUTE+"groups/", { headers: header })
			.then(() => {
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