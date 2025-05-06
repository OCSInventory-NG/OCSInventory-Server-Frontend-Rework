<template>
	<div 
		id="locale-switcher" 
		class="locale-switcher"
	>
		<BFormSelect
			v-model="$root.$i18n.locale" 
			:options="supportedLocales"
			@input="setLocale"
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
		setLocale(event) {
			const locale = event?.target?.value || this.$root.$i18n.locale
			localStorage.setItem('locale', locale)
		}
	}
}
</script>