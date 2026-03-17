import type { StorybookConfig } from "storybook/react-vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    config.css = {
      ...config.css,
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    };
    return config;
  },
};

export default config;
