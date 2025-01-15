import type { Preview } from "@storybook/react";
import { ThemeDecorator } from "../src/stories/decorators/theme.tsx";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      inlineStories: true, // Display stories inline with the docs
      iframeHeight: 500, // Customize iframe height for preview
    },
    storySort: {
      order: [
        "Introduction",
        "How To Storybook",
        "Components",
        "Modals",
        "Alerts",
        "Sidebars",
      ],
    },
  },
  tags: ["autodocs"],
  decorators: [ThemeDecorator],
};

export default preview;
