import type { Preview } from "storybook";
import "../src/styles.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0a0f1e" }],
    },
  },
};

export default preview;
