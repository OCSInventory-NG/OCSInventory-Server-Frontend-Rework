<template>
	<div class="page-header d-print-none text-white">
		<div class="row align-items-center">
			<div class="col">
				<div class="page-pretitle">
					<Breadcrumb />
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
import Breadcrumb from '../Breadcrumb/Breadcrumb.vue';

export default {
	name: "PageHeader",
	components: { Breadcrumb },
	props: {
		pageTitle: { type: String, default: "" }
	},
}
</script>