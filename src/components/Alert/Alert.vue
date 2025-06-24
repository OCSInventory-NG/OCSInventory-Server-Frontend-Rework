<template>
	<b-row>
		<b-col
			v-if="cols"
			cols="3"
		/>
		<b-col>
			<b-alert
				:model-value="!!message"
				class="alert-sm alert-important"
				:variant="variant"
			>
				{{ message }}
			</b-alert>
		</b-col>
		<b-col
			v-if="cols"
			cols="3"
		/>
	</b-row>
</template>

<script>
export default {
	name: 'Alert',
	props: {
		message: { type: String, default: null },
		variant: { type: String, default: 'info'},
		cols: { type: Boolean, default: true }
	}
}
</script>