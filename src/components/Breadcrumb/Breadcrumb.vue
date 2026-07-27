<template>
	<div v-if="!excluded">
		<b-breadcrumb 
			:items="tree"
			class="breadcrumb-arrows"
		/>
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
			var breadcrumb = []

			// Keep the raw segments (underscore preserved) so the cumulative
			// path matches real routes (e.g. /configurations/compliance_settings).
			// The underscore is only turned into a space for display.
			var items = this.$route.path
				.split('/')
				.slice(1)

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

					if(path+"s" == route.path) {
						routeExists = true
						path = path + "s"
						return false
					}
					
					return true
				})

				if(routeExists) {
					breadcrumb.push({
						text: (this.$te("title." + item)) ? this.$t("title." + item) : item.replace(/_/g, " "),
						to: path,
						append: true,
						replace: true
					})
				} else {
					breadcrumb.push({
						text: (this.$te("title." + item)) ? this.$t("title." + item) : item.replace(/_/g, " "),
						disabled: true
					})
				}
			})

			return breadcrumb
		}
	}
}
</script>
