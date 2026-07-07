import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^(DRAFT|PUBLISHED|HIDDEN|PENDING|SENT|FAILED|NEW|CONTACTED|QUOTATION_SENT|NEGOTIATING|CONFIRMED_ORDER|CLOSED|CANCELLED|IN_PROGRESS|SUBMITTED|PROCESSING|DRAFT_STEP_\\d|READY_TO_SUBMIT|STEP_\\d|CUSTOMER_CONFIRM|STEP_COMPLETED|CUSTOMER_CHANGED|PRODUCT_CHANGED|COMMERCIAL_CHANGED|REQUIREMENT_CHANGED|AUTO_SAVED|CONTINUE)$",
        },
      ],
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
