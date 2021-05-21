<template>
	<div class="data-loader">
		<b-icon
			icon="three-dots"
			animation="cylon"
			font-scale="4"
		/>
	</div>
</template>

<script>
export default {
	name: 'Loader',
	props: {
		size: {type: Number, default: 21}
	}
}
</script>
