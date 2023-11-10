<template>
	<div 
		id="locale-switcher" 
		class="locale-switcher"
	>
		<b-form-select 
			v-model="$root.$i18n.locale"
			class="form-select"
			@change="setLocale()"
		>
			<b-form-select-option 
				v-for="(lang, i) in langs" 
				:key="`Lang${i}`" 
				:value="i"
			>
				{{ lang }}
			</b-form-select-option>
		</b-form-select>
	</div>
</template>

<script>
export default {
	name: 'LocaleSwitcher',
	data() {
		return {
			langs: {
				'fr': 'Français',
				'en': 'English'
			}
		};
	},
	methods: {
		setLocale() {
			localStorage.setItem('lang', this.$root.$i18n.locale)
		}
	}
}
</script>