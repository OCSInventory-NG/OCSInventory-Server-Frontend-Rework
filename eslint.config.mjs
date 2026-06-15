import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import globals from "globals";

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
			indent: ["error", "tab"],
			"max-len": ["error", { code: 128 }],
			"no-tabs": "off",
			"no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
			"vue/html-indent": ["error", "tab"],
			"vue/multi-word-component-names": "off",
			"vue/no-reserved-component-names": "off",
			"vue/valid-v-slot": "error",
			"vue/no-multiple-template-root": "off",
			"vue/no-v-model-argument": "off"
		}
	}
];