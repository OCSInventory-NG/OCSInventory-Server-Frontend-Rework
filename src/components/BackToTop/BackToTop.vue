<template>
	<div
		v-show="isVisible"
		id="back-to-top"
		aria-label="Back to top"
	>
		<b-button
			class="rounded-circle"
			@click="scrollToTop"
		>
			<font-awesome-icon
				:icon="['fas', 'arrow-up']"
				size="1x"
			/>
		</b-button>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const checkScroll = () => {
	isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
	window.scrollTo({
		top: 0, behavior: 'smooth'
	})
}

onMounted(() => {
	window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
	window.removeEventListener('scroll', checkScroll)
})
</script>