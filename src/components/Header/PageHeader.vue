<template>
	<div class="page-header d-print-none text-white">
		<div class="row align-items-center">
			<div class="col">
				<div class="page-pretitle">
					<Breadcrumb :current-label="objectLabel" />
				</div>
				<h2 
					v-if="$te('title.'+pageTitle)"
					class="page-title"
				>
					{{ $t('title.'+pageTitle) }}
				</h2>
				<h2 
					v-else
					class="page-title"
				>
					{{ pageTitle }}
				</h2>
			</div>
			<div class="col-auto ms-auto" />
		</div>
	</div>
</template>

<script>
export default {
	name: "PageHeader",
	props: {
		pageTitle: { type: String, default: "" },
		breadcrumbLabel: { type: String, default: "" }
	},
	computed: {
		objectLabel() {
			if (this.breadcrumbLabel) {
				return this.breadcrumbLabel
			}

			return this.$te('title.' + this.pageTitle) ? "" : this.pageTitle
		}
	},
}
</script>