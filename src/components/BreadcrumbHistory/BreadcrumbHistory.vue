<template>
	<div v-if="!excluded">
		<b-breadcrumb :items="tree"></b-breadcrumb>
	</div>
</template>

<script>
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
			return ['OCS Inventory']
				.concat(this.$route.path
					.split('/')
					.slice(1)
					.map(route => route
						.split('_')
						.map(word => word[0].toUpperCase() + word.slice(1))
						.join(' ')
					)
				);
		}
    }
}
</script>
