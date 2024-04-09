<template>
	<b-alert 
		:model-value="!!message" 
		class="alert-sm" 
		:variant="variant"
	>
		{{ message }}
	</b-alert>
</template>

<script>
export default {
	name: 'Alert',
	props: {
		message: { type: String, default: null },
		variant: { type: String, default: 'info'}
	}
}
</script>