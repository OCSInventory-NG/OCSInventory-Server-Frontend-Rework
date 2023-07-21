<template>
	<div v-if="!excluded">
		<b-breadcrumb 
			:items="tree"
			class="breadcrumb-arrows"
		/>
	</div>
</template>

<script>
import i18n from '../../i18n'

export default {
	name: 'BreadcrumbHistory',
	props: {
		exclude: {type: Array, default: () => []}
	},
	computed: {
		excluded() {
			return this.exclude.indexOf(this.$route.path.split('/').pop()) > -1;
		},
		tree() {
			return this.$route.path
				.split('/')
				.slice(1)
				.map(route => route
					.split('_')
					.map(word => {
						if(i18n.te('title.' + word)) {
							return i18n.t('title.' + word)
						}
						return i18n.t(word)
					})
					.join(' ')
				);
		}
	}
}
</script>
