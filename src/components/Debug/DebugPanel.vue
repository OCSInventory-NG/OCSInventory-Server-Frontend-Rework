<template>
	<div
		v-if="active"
		class="debug-panel d-print-none"
	>
		<div
			class="navbar navbar-expand debug-panel-bar"
			data-bs-theme="dark"
			@pointerdown="startResize"
		>
			<div class="container-fluid">
				<span
					class="navbar-text debug-panel-title"
					:title="$t('debug.title')"
				>
					<font-awesome-icon :icon="['fas', 'bug']" />
				</span>
				<ul class="navbar-nav">
					<li
						v-for="(section, idx) in sections"
						:key="idx"
						class="nav-item"
					>
						<button
							type="button"
							class="nav-link"
							:class="{ active: idx === activeSection && !store.collapsed }"
							@click="select(idx)"
						>
							{{ sectionTitle(section) }}
						</button>
					</li>
				</ul>
				<div class="navbar-nav ms-auto">
					<button
						type="button"
						class="nav-link"
						:title="store.collapsed ? $t('debug.expand') : $t('debug.collapse')"
						@click="store.collapsed = !store.collapsed"
					>
						<font-awesome-icon :icon="['fas', store.collapsed ? 'angle-up' : 'angle-down']" />
					</button>
					<button
						type="button"
						class="nav-link"
						:title="$t('debug.close')"
						@click="close"
					>
						<font-awesome-icon :icon="['fas', 'xmark']" />
					</button>
				</div>
			</div>
		</div>
		<div
			v-show="!store.collapsed"
			class="debug-panel-body"
		>
			<div class="debug-panel-content">
				<Alert
					v-if="store.error"
					variant="danger"
					:message="store.error"
				/>
				<component
					:is="currentComponent"
					v-if="currentComponent"
					v-bind="context"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { defineAsyncComponent, markRaw } from "vue"
import { getSlotEntries } from "@/extensions/slotRegistry"
import {
	debugStore,
	isDebugActive,
	maxPanelHeight,
	minPanelHeight,
	savePanelHeight,
	setDebugMode,
} from "@/debug/debugStore"

export default {
	name: "DebugPanel",
	data() {
		return {
			store: debugStore,
			activeSection: 0,
		}
	},
	computed: {
		active() {
			return isDebugActive()
		},
		context() {
			return {
				route: this.$route,
				trace: this.store.trace,
				checked: this.store.checked,
				calls: this.store.calls,
			}
		},
		// depends on the route, so sections registered by extensions loaded
		// during navigation show up
		sections() {
			return getSlotEntries("debug.panel", this.context)
		},
		currentComponent() {
			const section = this.sections[this.activeSection] || this.sections[0]
			if (!section) return null
			// same convention as ExtensionSlot: a function is a lazy loader
			return markRaw(
				typeof section.component === "function"
					? defineAsyncComponent(section.component)
					: section.component
			)
		},
	},
	methods: {
		// the bar is the resize handle, its buttons keep their click. The panel
		// follows the pointer down to 0, released below the minimum height it
		// collapses and keeps its last height for the next opening
		startResize(event) {
			if (event.button !== 0 || event.target.closest("button")) return
			event.preventDefault()

			const startY = event.clientY
			const lastHeight = this.store.height
			// a collapsed panel has no visible body, it opens while dragged up
			const startHeight = this.store.collapsed ? 0 : this.store.height
			let dragged = false

			const resize = (move) => {
				dragged = true
				const height = startHeight + startY - move.clientY
				this.store.collapsed = false
				this.store.height = Math.round(Math.min(Math.max(height, 0), maxPanelHeight()))
			}
			const stop = () => {
				window.removeEventListener("pointermove", resize)
				window.removeEventListener("pointerup", stop)
				if (!dragged) return
				if (this.store.height < minPanelHeight()) {
					this.store.collapsed = true
					this.store.height = lastHeight
				}
				savePanelHeight()
			}
			window.addEventListener("pointermove", resize)
			window.addEventListener("pointerup", stop)
		},
		select(idx) {
			this.activeSection = idx
			this.store.collapsed = false
		},
		sectionTitle(section) {
			return this.$te(section.title) ? this.$t(section.title) : section.title
		},
		close() {
			setDebugMode(false)
		},
	},
}
</script>
