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
import Loader from '@/components/Loader/Loader';

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
			errored: false
		}
	},
}
</script>
