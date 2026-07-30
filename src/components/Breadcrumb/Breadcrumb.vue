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
		exclude: {type: Array, default: () => []},
		currentLabel: {type: String, default: ''}
	},
	computed: {
		excluded() {
			return this.exclude.indexOf(this.$route.path.split('/').pop()) > -1;
		},
		tree() {
			var breadcrumb = []

			var segments = this.$route.path
				.split('/')
				.slice(1)

			var items = segments
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

					if(path+"s" == route.path) {
						routeExists = true
						path = path + "s"
						return false
					}
					
					return true
				})

				if(routeExists) {
					breadcrumb.push({
						text: (this.$te("title." + item.replace(/ /g,"_"))) ? this.$t("title." + item.replace(/ /g,"_")) : item,
						to: path,
						append: true,
						replace: true
					})
				} else {
					breadcrumb.push({
						text: (this.$te("title." + item.replace(/ /g,"_"))) ? this.$t("title." + item.replace(/ /g,"_")) : item,
						disabled: true
					})
				}
			})

			if(this.currentLabel && breadcrumb.length) {
				var lastSegment = segments[segments.length - 1]
				var params = Object.values(this.$route.params)
					.flat()
					.map(param => String(param))

				if(params.includes(lastSegment)) {
					breadcrumb[breadcrumb.length - 1].text = this.currentLabel
				}
			}

			return breadcrumb
		}
	}
}
</script>
