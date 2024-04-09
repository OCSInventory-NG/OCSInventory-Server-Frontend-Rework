<template>
	<div 
		id="locale-switcher" 
		class="locale-switcher"
	>
		<BFormSelect
			v-model="$root.$i18n.locale" 
			:options="supportedLocales"
			@change="setLocale"
		/>
	</div>
</template>

<script>
export default {
	name: 'LocaleSwitcher',
	data() {
		return {
			supportedLocales: [
				{value: 'fr', text: 'Français'},
				{value: 'en', text: 'English'},
			]
		}
	},
	methods: {
		setLocale() {
			localStorage.setItem('locale', this.$root.$i18n.locale)
		}
	}
}
</script>