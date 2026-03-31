import { defineConfig } from "eslint/config";
import vue from "eslint-plugin-vue";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended", "plugin:vue/recommended"),

    plugins: {
        vue,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        ecmaVersion: 5,
        sourceType: "module",
    },

    rules: {
        indent: ["error", "tab"],

        "max-len": ["error", {
            code: 128,
        }],

        "no-tabs": 0,

        "no-unused-vars": ["error", {
            varsIgnorePattern: "^_",
        }],

        "vue/html-indent": ["error", "tab"],
        "vue/multi-word-component-names": "off",
        "vue/no-reserved-component-names": "off",
        "vue/valid-v-slot": "error",
        "vue/no-multiple-template-root": "off",
        "vue/no-v-model-argument": "off",
    },
}]);