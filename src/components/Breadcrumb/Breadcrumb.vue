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
			var breadcrumb = []

			var items = this.$route.path
				.split('/')
				.slice(1)
				.map(route => route
					.split('_')
					.map(word => {
						return word
					})
					.join(' ')
				)

			var path = "/"

			items.forEach(item => {
				if(path == "/") {
					path = path + item
				} else {
					path = path + "/" + item
				}
				
				var routeExists = false

				this.$router.getRoutes().every(route => {
					if(path == route.path) {
						routeExists = true
						return false
					}
					return true
				})

				if(routeExists) {
					breadcrumb.push({
						text: (i18n.te("title." + item)) ? i18n.t("title." + item) : item,
						to: path,
						append: true,
						replace: true
					})
				} else {
					breadcrumb.push({
						text: (i18n.te("title." + item)) ? i18n.t("title." + item) : item,
						disabled: true
					})
				}
			})

			return breadcrumb
		}
	}
}
</script>
