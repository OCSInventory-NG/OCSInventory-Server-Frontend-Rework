<template>
  <div
    id="back-to-top"
    v-show="isVisible"
    aria-label="Back to top"
  >
    <b-button
        @click="scrollToTop"
        class="rounded-circle"
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