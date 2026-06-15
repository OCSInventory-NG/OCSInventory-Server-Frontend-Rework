import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
	{
		ignores: ["dist/**", "node_modules/**", "coverage/**", "build/**"]
	},
	js.configs.recommended,
	...vue.configs["flat/recommended"],
	{
		files: ["**/*.{js,mjs,cjs,vue}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			"no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
			"vue/multi-word-component-names": "off",
			"vue/no-reserved-component-names": "off",
			"vue/valid-v-slot": "error",
			"vue/no-multiple-template-root": "off",
			"vue/no-v-model-argument": "off"
		}
	},
	// Must be last: disables all ESLint formatting rules that conflict with Prettier.
	prettier
];