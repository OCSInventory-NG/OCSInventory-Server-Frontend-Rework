<template>
	<div class="data-loader">
		<i 
			:style="{fontSize: size + 'px'}" 
			class="la la-spinner la-spin"
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
