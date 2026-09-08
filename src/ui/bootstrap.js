// src/ui/bootstrap.js
import { createBootstrap } from "bootstrap-vue-next"

import {
	BButton,
	BModal,
	BForm,
	BRow,
	BCol,
	BFormGroup,
	BFormTextarea,
	BSpinner,
	BTabs,
	BTab,
} from "bootstrap-vue-next"

const BOOTSTRAP_COMPONENTS = {
	BButton,
	BModal,
	BForm,
	BRow,
	BCol,
	BFormGroup,
	BFormTextarea,
	BSpinner,
	BTabs,
	BTab,
}

export function installBootstrapUi(app) {
	app.use(createBootstrap())

	for (const [name, comp] of Object.entries(BOOTSTRAP_COMPONENTS)) {
		if (comp) app.component(name, comp)
	}

	if (import.meta?.env?.DEV) {
		// eslint-disable-next-line no-console
		console.log(
			"[BootstrapUI] registered:",
			Object.keys(BOOTSTRAP_COMPONENTS).filter((k) => !!app._context.components[k])
		)
	}
}
