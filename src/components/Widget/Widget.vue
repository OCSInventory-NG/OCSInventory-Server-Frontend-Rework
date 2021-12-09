<template>
	<section 
		ref="widget" 
		:class="{
			widget: true,
			className,
			collapsed: state === 'collapse',
			fullscreened: state === 'fullscreen',
			loading: fetchingData
		}"
	>
		<h5 
			v-if="title && typeof title === 'string' && !customHeader" 
			class="title">{{ title }}</h5>
		<!-- eslint-disable vue/no-v-html -->
		<header 
			v-if="title && customHeader" 
			class="title" 
			v-html="title"/>
		<!--eslint-enable-->
		<div 
			v-if="!customControls && mainControls"
			class="widgetcontrols widget-controls"
		>
			<a 
				v-if="settings || settingsInverse" 
				href="#">
				<i class="la la-cog"/>
			</a>
			<a 
				v-if="refresh" 
				:id="`reloadId-${randomId}`" 
				href="#" 
				@click="loadWidgster($event)">
				<strong 
					v-if="typeof refresh === 'string'" 
					class="text-gray-light">{{ refresh }}</strong>
				<i 
					v-else 
					class="la la-refresh"/>
				<b-tooltip
					v-if="showTooltip"
					:placement="tooltipPlacement"
					:target="`reloadId-${randomId}`"
				>
					Reload
				</b-tooltip>
			</a>
			<a 
				v-if="fullscreen && state !== 'fullscreen'" 
				:id="`fullscreenId-${randomId}`" 
				href="#" 
				@click="changeState($event, 'fullscreen')">
				<i class="glyphicon glyphicon-resize-full"/>
				<b-tooltip
					v-if="showTooltip"
					:placement="tooltipPlacement"
					:target="`fullscreenId-${randomId}`"
				>
					Fullscreen
				</b-tooltip>
			</a>
			<a 
				v-if="fullscreen && state === 'fullscreen'" 
				:id="`restoreId-${randomId}`" 
				href="#" 
				@click="changeState($event, 'default')">
				<i class="glyphicon glyphicon-resize-small"/>
				<b-tooltip
					v-if="showTooltip"
					:placement="tooltipPlacement"
					:target="`restoreId-${randomId}`"
				>
					Restore
				</b-tooltip>
			</a>
			<span v-if="collapse && state !== 'collapse'">
				<a 
					:id="`collapseId-${randomId}`" 
					href="#" 
					@click="changeState($event, 'collapse')">
					<i class="la la-angle-down"/>
					<b-tooltip
						v-if="showTooltip"
						:placement="tooltipPlacement"
						:target="`collapseId-${randomId}`"
					>
						Collapse
					</b-tooltip>
				</a>
			</span>
			<span v-if="collapse && state === 'collapse'">
				<a 
					:id="`expandId-${randomId}`" 
					href="#" 
					@click="changeState($event, 'default')">
					<i class="la la-angle-up"/>
					<b-tooltip
						v-if="showTooltip"
						:placement="tooltipPlacement"
						:target="`expandId-${randomId}`"
					>
						Expand
					</b-tooltip>
				</a>
			</span>
			<a 
				v-if="close" 
				:id="`closeId-${randomId}`" 
				href="#" 
				@click="closeWidget($event)">
				<strong 
					v-if="typeof refresh === 'string'" 
					class="text-gray-light">{{ close }}</strong>
				<i 
					v-else 
					class="la la-remove"/>
				<b-tooltip
					v-if="showTooltip"
					:placement="tooltipPlacement"
					:target="`closeId-${randomId}`"
				>
					Close
				</b-tooltip>
			</a>
		</div>
		<!-- eslint-disable vue/no-v-html -->
		<div 
			v-if="customControls" 
			ref="customControlsRef" 
			class="widgetcontrols widget-controls" 
			v-html="customControls"/>
		<!--eslint-enable-->
		<div 
			ref="widgetbodyRef" 
			:class="`widgetbody widget-body ${bodyClass}`"
			:style="{display: state === 'collapse' ? 'none' : ''}"
		>
			<Loader 
				v-if="fetchingData && showLoader" 
				:class="'widget-loader'" 
				:size="40"/>
			<slot v-else/>
		</div>
	</section>
</template>

<script>
import Loader from '../Loader/Loader';

export default {
	name: 'Widget',
	components: { 
		Loader 
	},
	props: {
		customHeader: { type: Boolean, default: false },
		tooltipPlacement: { type: String, default: 'top' },
		showTooltip: { type: Boolean, default: false },
		close: { type: [Boolean, String], default: false },
		fullscreen: { type: [Boolean, String], default: false },
		collapse: { type: [Boolean, String], default: false },
		settings: { type: [Boolean, String], default: false },
		settingsInverse: { type: Boolean, default: false },
		refresh: { type: [Boolean, String], default: false },
		className: { type: String, default: '' },
		title: { type: String, default: '' },
		customControls: { type: Object, default: null },
		bodyClass: { type: String, default: '' },
		options: { type: Function, default: () => ({}) },
		fetchingData: {type: Boolean, default: false},
		showLoader: {type: Boolean, default: true},
		collapsed: {type: Boolean, default: false},
		autoload: {type: [Boolean, Number], default: false}
	},
	data: function() {
		return {
			state: this.collapsed ? 'collapse' : 'default'
		}
	},
	computed: {
		randomId() {
			return Math.floor(Math.random() * 100);
		},
		mainControls() {
			return !!(this.close || this.fullscreen || this.collapse || this.refresh || this.settings || this.settingsInverse);
		},
	},
	mounted() {
		if (this.autoload && this.$listeners && this.$listeners.load) {
			this.loadWidgster();
			if (typeof this.autoload === 'number') {
				setInterval(() => {this.loadWidgster()}, this.autoload);
			}
		}
		if (this.customControls) {
			let close = this.$refs.customControlsRef.querySelector('[control=close]');
			close && close.addEventListener('click', this.closeWidget);
			let collapse = this.$refs.customControlsRef.querySelector('[control=collapse]');
			collapse && collapse.addEventListener('click', this.changeState.bind(this, null, 'collapse'));
			let expand = this.$refs.customControlsRef.querySelector('[control=expand]');
			expand && expand.addEventListener('click', this.changeState.bind(this, null, 'default'));
			let fullscreen = this.$refs.customControlsRef.querySelector('[control=fullscreen]');
			fullscreen && fullscreen.addEventListener('click', this.changeState.bind(this, null, 'fullscreen'));
			let restore = this.$refs.customControlsRef.querySelector('[control=restore]');
			restore && restore.addEventListener('click', this.changeState.bind(this, null, 'default'));
			let load = this.$refs.customControlsRef.querySelector('[control=load]');
			load && load.addEventListener('click', this.loadWidgster);
		}
	},
	methods: {
		closeWidget(e) {
			e && e.preventDefault();
			let $parentEl = this.$el.parentElement;
			let length = $parentEl.classList.length;
			let parentToRemove = false;
			for (let i = 0; i < length; i++) {
				if (/col.*/.test($parentEl.classList[i])) {
					parentToRemove = true;
					break;
				}
			}

			let removeFunction = () => {
				parentToRemove ? $parentEl.remove() : this.$el.remove();
			};

			if (this.$listeners && this.$listeners.close) {
				this.$listeners.close(removeFunction.bind(this));
			} else {
				removeFunction();
			}
		},
		changeState(e, state) {
			e && e.preventDefault();
			this.state = state;
		},
		loadWidgster(e) {
			e && e.preventDefault();
			this.$emit('load');
		}
	}
};
</script>
