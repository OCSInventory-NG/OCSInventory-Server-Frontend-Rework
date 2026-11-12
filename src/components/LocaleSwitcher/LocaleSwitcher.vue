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
import { supportedLocales } from '@/i18n'

export default {
	name: 'LocaleSwitcher',
	data() {
		return {
			supportedLocales
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
